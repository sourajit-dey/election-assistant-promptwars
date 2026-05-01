/**
 * @file functions/index.js
 * @description Google Cloud Function — VoteGuide India Chat Proxy.
 *              Proxies all Gemini AI requests server-side so the
 *              API key is never exposed to the client browser.
 *              Validates input, sanitizes content, enforces limits,
 *              and adds proper CORS and security headers.
 * @author VoteGuide India
 * @version 1.0.0
 */

const functions = require('@google-cloud/functions-framework');

/**
 * System prompt kept server-side for security.
 * Never sent to client browser.
 * @type {string}
 */
const ELECTION_SYSTEM_PROMPT = `You are VoteGuide, a friendly 
and knowledgeable Indian election assistant. Help Indian citizens 
understand the complete Lok Sabha election process — from voter 
registration to counting day.

RULES YOU MUST ALWAYS FOLLOW:
1. Only answer questions about Indian elections. For anything 
   else say exactly: "I am here to help with Indian election 
   questions only. What would you like to know about voting?"
2. NEVER recommend any political party or candidate. If asked:
   "My job is to explain the process — your vote is entirely 
   your own decision."
3. Structure every answer: one direct sentence first, then 
   numbered steps or explanation, then end with exactly two 
   suggested follow-up questions.
4. Keep answers under 150 words unless a process needs more.
5. Always cite official sources where relevant: eci.gov.in, 
   voters.eci.gov.in, Voter Helpline 1950.
6. Speak simply — you are talking to a first-time voter aged 18.

KEY FACTS:
- New voter registration: Form 6 at voters.eci.gov.in
- Overseas (NRI) registration: Form 6A at nvsp.in
- Address/name correction: Form 8
- Eligibility: 18+ Indian citizen, name on electoral roll,
  not imprisoned, not disqualified under RPA 1951
- Age 17 can pre-register — activates at 18
- Election stages: Announcement → Nomination (Form 2B,
  Rs 25,000 deposit) → Scrutiny → Withdrawal → Campaign
  → Polling → Counting
- MCC: starts on schedule announcement, ends on result day
- EVM: Ballot Unit + Control Unit. Stores up to 2,000 votes
- VVPAT: paper slip visible 7 seconds. Voter cannot take it
- NOTA: Option 99. Introduced 2013 by Supreme Court (PUCL case)
- Polling hours: 7AM to 6PM. Indelible ink on left index finger
- No booth more than 2km from any voter
- 272 of 543 seats needed for Lok Sabha majority
- Accepted IDs: Aadhaar, PAN, Passport, Driving Licence,
  MNREGA card, Bank passbook with photo
- cVIGIL app: report MCC violations, 100-min response
- Voter Helpline: 1950 (toll free, 24x7 during elections)`;

/**
 * @description Sanitizes input string server-side to prevent
 *              injection attacks before sending to Gemini API
 * @param {string} input - Raw user input
 * @returns {string} Sanitized safe string
 */
function sanitizeServerSide(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

/**
 * @description Main HTTP Cloud Function — VoteGuide chat endpoint.
 *              Accepts POST with {message, history} body.
 *              Returns {response: string} on success.
 *              API key stored as environment variable — never
 *              exposed to client browser under any circumstance.
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<void>}
 */
functions.http('voteGuideChat', async (req, res) => {
  /* Security headers */
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains');

  /* CORS — allow browser requests from any origin */
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  /* Handle CORS preflight request */
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  /* Reject non-POST methods */
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  /* Validate request body exists */
  if (!req.body) {
    res.status(400).json({ error: 'Request body required' });
    return;
  }

  const { message, history } = req.body;

  /* Validate message field */
  if (!message || typeof message !== 'string') {
    res.status(400).json({
      error: 'Valid message string required'
    });
    return;
  }

  /* Enforce input length limit */
  if (message.length > 500) {
    res.status(400).json({
      error: 'Message too long. Maximum 500 characters allowed.'
    });
    return;
  }

  /* Reject obviously empty messages */
  if (message.trim().length === 0) {
    res.status(400).json({ error: 'Message cannot be empty' });
    return;
  }

  /* Server-side sanitization */
  const safeMessage = sanitizeServerSide(message);

  /* Get API key from Cloud environment — never from client */
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable not set');
    res.status(500).json({
      error: 'Service temporarily unavailable'
    });
    return;
  }

  /* Build safe conversation history — max 10 entries */
  const safeHistory = Array.isArray(history)
    ? history.slice(-10).map(function(entry) {
        return {
          role: entry.role === 'model' ? 'model' : 'user',
          parts: [{ text: sanitizeServerSide(
            String(entry?.parts?.[0]?.text || '')
          )}]
        };
      })
    : [];

  const contents = [
    ...safeHistory,
    { role: 'user', parts: [{ text: safeMessage }] }
  ];

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: ELECTION_SYSTEM_PROMPT }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.4
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API returned ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'I could not generate a response. Please try again.';

    res.status(200).json({ response: responseText });

  } catch (error) {
    console.error('Cloud Function error:', error.message);
    res.status(500).json({
      error: 'Unable to connect. Please try again or call 1950.'
    });
  }
});
