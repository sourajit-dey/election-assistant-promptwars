/* chatbot.js — VoteGuide AI Chatbot powered by Gemini */

var SYSTEM_PROMPT = 'You are VoteGuide, a friendly Indian election assistant. Help Indian citizens understand the Lok Sabha election process \u2014 registration, timelines, polling, counting, and eligibility.\n\nRULES:\n1. Only answer questions about Indian elections. For anything else say: \"I am here to help with Indian election questions only.\"\n2. NEVER recommend any party or candidate. If asked say: \"My job is to explain the process, not influence your vote \u2014 that is yours!\"\n3. Structure every answer: one direct sentence first, then numbered steps or explanation, then end with \"What else would you like to know?\" and 2 suggested follow-up questions.\n4. Keep answers under 150 words unless a process requires more steps.\n5. Cite official sources: eci.gov.in, voters.eci.gov.in, electoralsearch.eci.gov.in, Voter Helpline 1950.\n6. Speak simply. You are talking to a first-time voter aged 18.\n\nYOUR KNOWLEDGE:\n- New voter registration: Form 6 at voters.eci.gov.in\n- Overseas voter registration: Form 6A\n- Address correction: Form 8. Deletion: Form 7\n- Eligibility: 18+ Indian citizen, name on electoral roll, not imprisoned, not disqualified under RPA 1951\n- Age 17 can apply in advance \u2014 registration activates at 18\n- Election stages: Announcement \u2192 Nomination (Form 2B, Rs 25,000 deposit for general / Rs 12,500 for SC-ST) \u2192 Scrutiny \u2192 Withdrawal \u2192 Campaign \u2192 Polling \u2192 Counting\n- MCC starts on schedule announcement day, ends on result day\n- EVM: Ballot Unit + Control Unit. Stores 2000 votes.\n- VVPAT: paper slip visible 7 seconds. Cannot be taken by voter.\n- NOTA: Option 99. Introduced 2013 by Supreme Court.\n- Polling hours: 7AM to 6PM. Indelible ink on left index finger.\n- No polling booth more than 2km from any voter.\n- 272 of 543 seats needed for Lok Sabha majority.\n- Accepted alternate IDs at booth: Aadhaar, PAN, Passport, Driving Licence, MNREGA card, Bank passbook with photo.\n- cVIGIL app: report MCC violations, 100-minute response guarantee.\n- Voter Helpline: 1950 (toll free)';

/* ---------- Gemini API Call ---------- */
function sendToGemini(userMessage, conversationHistory) {
  // Check if API key is available
  if (typeof GEMINI_API_KEY === 'undefined' || !GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('[VoteGuide] GEMINI_API_KEY is not configured.');
    return Promise.resolve('API key is not configured. Please set your Gemini API key in js/config.js');
  }

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory
    })
  })
  .then(function(res) {
    if (!res.ok) {
      console.error('[VoteGuide] API HTTP error:', res.status, res.statusText);
      return res.json().then(function(errData) {
        console.error('[VoteGuide] API error body:', JSON.stringify(errData));
        if (res.status === 429) {
          return { _error: 'I am receiving too many requests right now. Please wait a moment and try again.' };
        }
        if (res.status === 400) {
          return { _error: 'There was a problem with the request. Please try rephrasing your question.' };
        }
        if (res.status === 403) {
          return { _error: 'API key may be restricted. Please check your Gemini API key permissions.' };
        }
        return { _error: 'Something went wrong (error ' + res.status + '). Please try again.' };
      }).catch(function() {
        return { _error: 'Connection error (HTTP ' + res.status + '). Please try again or call Voter Helpline 1950.' };
      });
    }
    return res.json();
  })
  .then(function(data) {
    // Check if we set an error in the previous step
    if (data && data._error) {
      return data._error;
    }
    console.log('[VoteGuide] API response:', JSON.stringify(data).substring(0, 200));
    if (data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    // API returned but no candidates — could be a safety filter or empty response
    if (data && data.promptFeedback) {
      console.warn('[VoteGuide] Prompt blocked:', JSON.stringify(data.promptFeedback));
      return 'I could not process that question. Please try asking something else about Indian elections.';
    }
    console.warn('[VoteGuide] Unexpected response format:', JSON.stringify(data));
    return 'I am having trouble connecting. Please try again or call Voter Helpline 1950.';
  })
  .catch(function(err) {
    console.error('[VoteGuide] Fetch error:', err);
    return 'I am having trouble connecting. Please check your internet and try again, or call Voter Helpline 1950.';
  });
}

/* ---------- Build Chatbot UI & Logic ---------- */
function buildChatbot() {
  var conversationHistory = [];
  var chatOpen = false;
  var firstOpen = true;
  var waiting = false;

  // --- Create floating button ---
  var fab = document.createElement('button');
  fab.className = 'chatbot-fab';
  fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML = '\uD83D\uDDF3\uFE0F';
  document.body.appendChild(fab);

  // --- Create chat window ---
  var win = document.createElement('div');
  win.className = 'chatbot-window';
  win.innerHTML =
    '<div class="chatbot-header">' +
      '<div class="chatbot-header-info">' +
        '<div class="chatbot-header-title">VoteGuide AI</div>' +
        '<div class="chatbot-header-sub">Powered by Gemini</div>' +
      '</div>' +
      '<button class="chatbot-close" aria-label="Close chat">\u00D7</button>' +
    '</div>' +
    '<div class="chatbot-messages" id="chatbot-messages"></div>' +
    '<div class="chatbot-input-area">' +
      '<input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask about elections\u2026" autocomplete="off">' +
      '<button class="chatbot-send" id="chatbot-send">Send</button>' +
    '</div>';
  document.body.appendChild(win);

  var messagesDiv = win.querySelector('#chatbot-messages');
  var inputEl = win.querySelector('#chatbot-input');
  var sendBtn = win.querySelector('#chatbot-send');
  var closeBtn = win.querySelector('.chatbot-close');

  // --- Toggle chat ---
  fab.addEventListener('click', function() {
    chatOpen = !chatOpen;
    if (chatOpen) {
      win.classList.add('open');
      fab.classList.add('active');
      if (firstOpen) {
        showWelcome();
        firstOpen = false;
      }
      inputEl.focus();
    } else {
      win.classList.remove('open');
      fab.classList.remove('active');
    }
  });

  closeBtn.addEventListener('click', function() {
    chatOpen = false;
    win.classList.remove('open');
    fab.classList.remove('active');
  });

  // --- Welcome message + chips ---
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

    var chipsWrap = document.createElement('div');
    chipsWrap.className = 'chatbot-chips';
    var chips = ['How do I register?', 'Am I eligible?', 'How does voting work?'];
    for (var i = 0; i < chips.length; i++) {
      (function(text) {
        var chip = document.createElement('button');
        chip.className = 'chatbot-chip';
        chip.textContent = text;
        chip.addEventListener('click', function() {
          chipsWrap.remove();
          handleSend(text);
        });
        chipsWrap.appendChild(chip);
      })(chips[i]);
    }
    messagesDiv.appendChild(chipsWrap);
    scrollToBottom();
  }

  // --- Message rendering ---
  function addUserBubble(text) {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-row chatbot-msg-user';
    var bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble chatbot-bubble-user';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messagesDiv.appendChild(wrap);
    scrollToBottom();
  }

  function addBotBubble(text) {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-row chatbot-msg-bot';
    var bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble chatbot-bubble-bot';
    bubble.innerHTML = formatBotText(text);
    wrap.appendChild(bubble);
    messagesDiv.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping() {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-row chatbot-msg-bot';
    wrap.id = 'chatbot-typing';
    var bubble = document.createElement('div');
    bubble.className = 'chatbot-bubble chatbot-bubble-bot chatbot-typing';
    bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    wrap.appendChild(bubble);
    messagesDiv.appendChild(wrap);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById('chatbot-typing');
    if (el) el.remove();
  }

  function formatBotText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function setInputEnabled(enabled) {
    waiting = !enabled;
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) inputEl.focus();
  }

  // --- Send logic ---
  function handleSend(overrideText) {
    var text = overrideText || inputEl.value.trim();
    if (!text || waiting) return;

    inputEl.value = '';
    addUserBubble(text);

    // Push to history
    conversationHistory.push({ role: 'user', parts: [{ text: text }] });

    // Trim history to max 10 entries
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
    }

    setInputEnabled(false);
    showTyping();

    sendToGemini(text, conversationHistory).then(function(reply) {
      hideTyping();
      conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
      }
      addBotBubble(reply);
      setInputEnabled(true);
    }).catch(function(err) {
      console.error('[VoteGuide] Unhandled error in handleSend:', err);
      hideTyping();
      addBotBubble('Something went wrong. Please try again or call Voter Helpline 1950.');
      setInputEnabled(true);
    });
  }

  // --- Event listeners ---
  sendBtn.addEventListener('click', function() { handleSend(); });
  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSend();
  });
}
