/**
 * @file analytics.js
 * @description Google Analytics 4 event tracking for VoteGuide India.
 *              Tracks anonymous user interactions with election features.
 *              All tracking functions are null-safe — they silently 
 *              return if gtag is not loaded, preventing any errors.
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * @description Safely calls gtag only if it is loaded and available
 * @param {...*} args - Arguments to pass to gtag
 * @returns {void}
 */
function safeGtag(...args) {
  if (typeof gtag === 'function') {
    gtag(...args);
  }
}

/**
 * @description Tracks when a user expands a timeline stage
 * @param {string} stageName - Name of the election stage viewed
 * @param {number} stageNumber - Stage number 1 through 7
 * @returns {void}
 */
function trackTimelineStageView(stageName, stageNumber) {
  safeGtag('event', 'timeline_stage_view', {
    event_category: 'Election Timeline',
    event_label: stageName,
    value: stageNumber
  });
}

/**
 * @description Tracks when a user completes the eligibility checker
 * @param {string} result - The eligibility result shown to user
 * @returns {void}
 */
function trackEligibilityCompletion(result) {
  safeGtag('event', 'eligibility_check_complete', {
    event_category: 'Eligibility Checker',
    event_label: result
  });
}

/**
 * @description Tracks when a user sends a message to the AI chatbot
 * @returns {void}
 */
function trackChatbotMessage() {
  safeGtag('event', 'chatbot_message_sent', {
    event_category: 'AI Chatbot',
    event_label: 'User Query'
  });
}

/**
 * @description Tracks glossary search usage anonymously
 * @param {boolean} hasQuery - Whether user typed a search term
 * @returns {void}
 */
function trackGlossarySearch(hasQuery) {
  safeGtag('event', 'glossary_search', {
    event_category: 'Glossary',
    event_label: hasQuery ? 'search_used' : 'search_cleared'
  });
}

/**
 * @description Tracks FAQ accordion expansion
 * @param {string} questionPreview - First 40 chars of question
 * @returns {void}
 */
function trackFAQExpand(questionPreview) {
  safeGtag('event', 'faq_expanded', {
    event_category: 'FAQ',
    event_label: questionPreview.substring(0, 40)
  });
}

/**
 * @description Tracks registration tab switching
 * @param {string} tabName - Name of the tab selected
 * @returns {void}
 */
function trackRegistrationTab(tabName) {
  safeGtag('event', 'registration_tab_view', {
    event_category: 'Registration Guide',
    event_label: tabName
  });
}
