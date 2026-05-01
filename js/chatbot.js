/**
 * @file chatbot.js
 * @description VoteGuide AI Chatbot powered by Google Gemini 2.0 Flash.
 *              Handles chat UI, API communication, input sanitization,
 *              rate limiting, and debounced send.
 * @author VoteGuide India
 * @version 1.0.0
 */

/* =========================================
   System Prompt for Gemini
   ========================================= */

const SYSTEM_PROMPT = `You are VoteGuide, a friendly Indian election assistant. Help Indian citizens understand the Lok Sabha election process \u2014 registration, timelines, polling, counting, and eligibility.

RULES:
1. Only answer questions about Indian elections. For anything else say: "I am here to help with Indian election questions only."
2. NEVER recommend any party or candidate. If asked say: "My job is to explain the process, not influence your vote \u2014 that is yours!"
3. Structure every answer: one direct sentence first, then numbered steps or explanation, then end with "What else would you like to know?" and 2 suggested follow-up questions.
4. Keep answers under 150 words unless a process requires more steps.
5. Cite official sources: eci.gov.in, voters.eci.gov.in, electoralsearch.eci.gov.in, Voter Helpline 1950.
6. Speak simply. You are talking to a first-time voter aged 18.

YOUR KNOWLEDGE:
- New voter registration: Form 6 at voters.eci.gov.in
- Overseas voter registration: Form 6A
- Address correction: Form 8. Deletion: Form 7
- Eligibility: 18+ Indian citizen, name on electoral roll, not imprisoned, not disqualified under RPA 1951
- Age 17 can apply in advance \u2014 registration activates at 18
- Election stages: Announcement \u2192 Nomination (Form 2B, Rs 25,000 deposit for general / Rs 12,500 for SC-ST) \u2192 Scrutiny \u2192 Withdrawal \u2192 Campaign \u2192 Polling \u2192 Counting
- MCC starts on schedule announcement day, ends on result day
- EVM: Ballot Unit + Control Unit. Stores 2000 votes.
- VVPAT: paper slip visible 7 seconds. Cannot be taken by voter.
- NOTA: Option 99. Introduced 2013 by Supreme Court.
- Polling hours: 7AM to 6PM. Indelible ink on left index finger.
- No polling booth more than 2km from any voter.
- 272 of 543 seats needed for Lok Sabha majority.
- Accepted alternate IDs at booth: Aadhaar, PAN, Passport, Driving Licence, MNREGA card, Bank passbook with photo.
- cVIGIL app: report MCC violations, 100-minute response guarantee.
- Voter Helpline: 1950 (toll free)`;

/* =========================================
   Gemini API Configuration
   ========================================= */

// Google Gemini 2.5 Flash-Lite API
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : ''}`;

/**
 * Cloud Function URL for secure server-side API proxy.
 * When set, all Gemini requests go through Cloud Function.
 * API key stays on server — never reaches browser.
 * @type {string}
 */
const CLOUD_FUNCTION_URL = 'https://us-central1-election-guide-promptwar.cloudfunctions.net/voteGuideChat';

/* Rate limiting: minimum 2 seconds between API requests */
let lastRequestTime = 0;

/* Maximum allowed input length */
const MAX_INPUT_LENGTH = 500;

/* =========================================
   Gemini API Call
   ========================================= */

/**
 * @description Sends user message to Gemini AI.
 *              Primary: routes through Cloud Function proxy
 *              so API key never reaches client browser.
 *              Fallback: direct API call for development.
 * @param {string} userMessage - Sanitized user input
 * @param {Array} conversationHistory - Previous messages array
 * @returns {Promise<string>} AI response text
 */
async function sendToGemini(userMessage, conversationHistory) {
  /* Cap history for token efficiency */
  const safeHistory = conversationHistory.slice(-10);

  /* Try Cloud Function proxy first — most secure */
  const useCloudFunction = CLOUD_FUNCTION_URL &&
    CLOUD_FUNCTION_URL !== 'REPLACE_WITH_CLOUD_FUNCTION_URL';

  if (useCloudFunction) {
    try {
      const res = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: safeHistory
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof recordChatbotQuery === 'function') {
          recordChatbotQuery();
        }
        trackChatbotMessage();
        return data.response ||
          'I could not generate a response. Please try again.';
      }
    } catch (_) {
      /* Fall through to direct API */
    }
  }

  /* Direct API fallback */
  if (!GEMINI_API_KEY ||
      GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    return 'AI assistant not configured. Please add API key.';
  }

  try {
    const contents = [
      ...safeHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    if (typeof recordChatbotQuery === 'function') {
      recordChatbotQuery();
    }
    trackChatbotMessage();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'I could not generate a response. Please try again.';
  } catch (_) {
    return 'I am having trouble connecting. Please try again ' +
      'or call Voter Helpline 1950.';
  }
}

/* =========================================
   Build Chatbot UI & Logic
   ========================================= */

/**
 * @description Builds the entire chatbot UI, attaches events, and manages chat state
 * @returns {void}
 */
function buildChatbot() {
  let conversationHistory = [];
  let chatOpen = false;
  let firstOpen = true;
  let waiting = false;

  /* --- Create floating action button --- */
  const fab = document.createElement('button');
  fab.className = 'chatbot-fab';
  fab.setAttribute('aria-label', 'Open VoteGuide AI chat assistant');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '\uD83D\uDDF3\uFE0F';
  document.body.appendChild(fab);

  /* --- Create chat window with header, messages, and input --- */
  const win = document.createElement('div');
  win.className = 'chatbot-window';
  win.innerHTML =
    '<div class="chatbot-header">' +
      '<div class="chatbot-header-info">' +
        '<div class="chatbot-header-title">VoteGuide AI</div>' +
        '<div class="chatbot-header-sub">Powered by Google Gemini 2.5 Flash-Lite</div>' +
      '</div>' +
      '<button class="chatbot-close" aria-label="Close chat window">\u00D7</button>' +
    '</div>' +
    '<div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite"></div>' +
    '<div class="chatbot-input-area">' +
      '<label for="chatbot-input" class="sr-only">Type your election question here</label>' +
      '<input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask about elections\u2026" autocomplete="off" aria-label="Type your election question here">' +
      '<button class="chatbot-send" id="chatbot-send" aria-label="Send message to VoteGuide AI">Send</button>' +
    '</div>';
  document.body.appendChild(win);

  /* Cache DOM references */
  const messagesDiv = win.querySelector('#chatbot-messages');
  const inputEl = win.querySelector('#chatbot-input');
  const sendBtn = win.querySelector('#chatbot-send');
  const closeBtn = win.querySelector('.chatbot-close');

  /* --- Toggle chat open/closed --- */

  /**
   * @description Opens or closes the chat window
   * @returns {void}
   */
  function handleFabClick() {
    chatOpen = !chatOpen;
    if (chatOpen) {
      win.classList.add('open');
      fab.classList.add('active');
      fab.setAttribute('aria-expanded', 'true');
      if (firstOpen) {
        showWelcome();
        firstOpen = false;
      }
      inputEl.focus();
    } else {
      win.classList.remove('open');
      fab.classList.remove('active');
      fab.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * @description Closes the chat window via the X button
   * @returns {void}
   */
  function handleCloseClick() {
    chatOpen = false;
    win.classList.remove('open');
    fab.classList.remove('active');
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', handleFabClick);
  closeBtn.addEventListener('click', handleCloseClick);

  /* --- Welcome message with suggestion chips --- */

  /**
   * @description Displays the welcome message and suggestion chips on first open
   * @returns {void}
   */
  function showWelcome() {
    addBotBubble(
      'Namaste! \uD83D\uDE4F I am VoteGuide, your Indian election guide.\n\n' +
      'I can help you with:\n' +
      '\u2022 How to register to vote\n' +
      '\u2022 The complete election process\n' +
      '\u2022 Your voter eligibility\n' +
      '\u2022 What happens on polling day\n\n' +
      'What would you like to know?'
    );

    /* Suggestion chip buttons for quick onboarding */
    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'chatbot-chips';
    const chips = ['How do I register?', 'Am I eligible?', 'How does voting work?'];

    for (let i = 0; i < chips.length; i++) {
      (function (text) {
        const chip = document.createElement('button');
        chip.className = 'chatbot-chip';
        chip.textContent = text;

        /** Handles chip click — sends the chip text as a message */
        function handleChipClick() {
          chipsWrap.remove();
          handleSend(text);
        }

        chip.addEventListener('click', handleChipClick);
        chipsWrap.appendChild(chip);
      })(chips[i]);
    }

    messagesDiv.appendChild(chipsWrap);
    scrollToBottom();
  }

  /* --- Message rendering helpers --- */

  /**
   * @description Adds a user message bubble to the chat window
   * @param {string} text - The user's message text
   * @returns {void}
   */
  function addUserBubble(text) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-row chatbot-msg-user';
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble chatbot-bubble-user';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messagesDiv.appendChild(wrap);
    scrollToBottom();
  }

  /**
   * @description Adds a bot response bubble with formatted text
   * @param {string} text - The bot's response text
   * @returns {void}
   */
  function addBotBubble(text) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-row chatbot-msg-bot';
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble chatbot-bubble-bot';
    bubble.innerHTML = formatBotText(text);
    wrap.appendChild(bubble);
    messagesDiv.appendChild(wrap);
    scrollToBottom();
  }

  /**
   * @description Shows the typing indicator (three dots animation)
   * @returns {void}
   */
  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-row chatbot-msg-bot';
    wrap.id = 'chatbot-typing';
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble chatbot-bubble-bot chatbot-typing';
    bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    wrap.appendChild(bubble);
    messagesDiv.appendChild(wrap);
    scrollToBottom();
  }

  /**
   * @description Removes the typing indicator from the chat
   * @returns {void}
   */
  function hideTyping() {
    const el = document.getElementById('chatbot-typing');
    if (el) el.remove();
  }

  /**
   * @description Escapes HTML entities and converts newlines to <br> for display
   * @param {string} text - Raw text from the API
   * @returns {string} Sanitized HTML string
   */
  function formatBotText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  /**
   * @description Scrolls the messages container to the bottom
   * @returns {void}
   */
  function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  /**
   * @description Enables or disables the chat input and send button
   * @param {boolean} enabled - Whether input should be enabled
   * @returns {void}
   */
  function setInputEnabled(enabled) {
    waiting = !enabled;
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) inputEl.focus();
  }

  /* --- Send logic with sanitization, validation, and rate limiting --- */

  /**
   * @description Handles sending a message — sanitizes, validates, rate-limits, and calls API
   * @param {string} [overrideText] - Optional text to send (from suggestion chips)
   * @returns {void}
   */
  function handleSend(overrideText) {
    const rawText = overrideText || inputEl.value.trim();
    if (!rawText || waiting) return;

    /* Sanitize the input to prevent XSS */
    const text = sanitizeInput(rawText);

    /* Validate input length */
    if (text.length === 0) return;
    if (text.length > MAX_INPUT_LENGTH) {
      addBotBubble('Please keep your question under ' + MAX_INPUT_LENGTH + ' characters.');
      return;
    }

    /* Rate limiting: enforce 2-second minimum between requests */
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      addBotBubble('Please wait a moment before sending another message.');
      return;
    }
    lastRequestTime = now;

    inputEl.value = '';
    addUserBubble(rawText);

    /* Add user message to conversation history */
    conversationHistory.push({ role: 'user', parts: [{ text: text }] });

    /* Cap conversation history at 10 entries to reduce token usage */
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    setInputEnabled(false);
    showTyping();

    sendToGemini(text, conversationHistory).then(function (reply) {
      hideTyping();
      conversationHistory.push({ role: 'model', parts: [{ text: reply }] });

      /* Keep history capped after bot reply too */
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }

      addBotBubble(reply);
      trackChatbotMessage();
      setInputEnabled(true);
    }).catch(function () {
      hideTyping();
      addBotBubble('Something went wrong. Please try again or call Voter Helpline 1950.');
      setInputEnabled(true);
    });
  }

  /* --- Event listeners with debounce --- */

  /** Debounced send handler to prevent double-click API calls */
  const debouncedSend = debounce(function () { handleSend(); }, 300);

  sendBtn.addEventListener('click', debouncedSend);

  /**
   * @description Handles Enter key in chat input
   * @param {KeyboardEvent} e - The keydown event
   * @returns {void}
   */
  function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  inputEl.addEventListener('keydown', handleInputKeydown);
}
