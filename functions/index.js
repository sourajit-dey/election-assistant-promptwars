/**
 * @file functions/index.js
 * @description Google Cloud Function — VoteGuide India Chat Proxy.
 *              Proxies all Gemini AI requests server-side so the
 *              API key is never exposed to the client browser.
 * @author VoteGuide India
 * @version 1.0.0
 */

const functions = require('@google-cloud/functions-framework');
// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

const ELECTION_SYSTEM_PROMPT = `You are VoteGuide, a friendly and knowledgeable Indian election assistant. Help Indian citizens understand the complete Lok Sabha election process.

RULES:
1. Only answer questions about Indian elections.
2. NEVER recommend any political party or candidate.
3. Structure every answer: one direct sentence first, then numbered steps, then two suggested follow-up questions.
4. Keep answers under 150 words.
5. Cite official sources: eci.gov.in, voters.eci.gov.in, Voter Helpline 1950.

KEY FACTS:
- New voter registration: Form 6 at voters.eci.gov.in
- Overseas (NRI): Form 6A at nvsp.in
- Address correction: Form 8
- Eligibility: 18+ Indian citizen, name on electoral roll, not imprisoned
- 272 of 543 seats needed for Lok Sabha majority
- Polling hours: 7AM to 6PM
- Voter Helpline: 1950`;

function sanitizeServerSide(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

functions.http('voteGuideChat', async (req, res) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!req.body) {
    res.status(400).json({ error: 'Request body required' });
    return;
  }

  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Valid message string required' });
    return;
  }

  if (message.length > 500) {
    res.status(400).json({ error: 'Message too long. Maximum 500 characters allowed.' });
    return;
  }

  if (message.trim().length === 0) {
    res.status(400).json({ error: 'Message cannot be empty' });
    return;
  }

  const safeMessage = sanitizeServerSide(message);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable not set');
    res.status(500).json({ error: 'Service temporarily unavailable' });
    return;
  }

  const safeHistory = Array.isArray(history)
    ? history.slice(-10).map(entry => ({
        role: entry.role === 'model' ? 'model' : 'user',
        parts: [{ text: sanitizeServerSide(String(entry?.parts?.[0]?.text || '')) }]
      }))
    : [];

  const contents = [
    ...safeHistory,
    { role: 'user', parts: [{ text: safeMessage }] }
  ];

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: ELECTION_SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API returned ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'I could not generate a response. Please try again.';

    res.status(200).json({ response: responseText });

  } catch (error) {
    console.error('Cloud Function error:', error.message);
    res.status(500).json({ error: 'Unable to connect. Please try again or call 1950.' });
  }
});
