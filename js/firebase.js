/**
 * @file firebase.js
 * @description Firebase Realtime Database integration.
 *              Tracks completely anonymous usage statistics.
 *              No personally identifiable information stored.
 *              All tracking functions fail silently on error.
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * Firebase project configuration.
 * Public config is safe to include in client code.
 * Data is protected by Firebase Realtime Database security rules.
 * @type {Object}
 */
const FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://REPLACE_WITH_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};

/** @type {Object|null} Firebase database reference */
let firebaseDb = null;

/** @type {boolean} Whether Firebase initialized successfully */
let firebaseInitialized = false;

/**
 * @description Initializes Firebase app and database connection.
 *              Called once on page load from main.js.
 *              Fails silently if Firebase SDK not available.
 * @returns {boolean} True if initialization succeeded
 */
function initFirebase() {
  try {
    if (typeof firebase === 'undefined') return false;
    if (FIREBASE_CONFIG.apiKey === 'REPLACE_WITH_FIREBASE_API_KEY') {
      return false;
    }
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    firebaseDb = firebase.database();
    firebaseInitialized = true;
    return true;
  } catch (_) {
    firebaseInitialized = false;
    return false;
  }
}

/**
 * @description Increments anonymous page visit counter
 * @returns {Promise<void>}
 */
async function trackVisit() {
  if (!firebaseInitialized || !firebaseDb) return;
  try {
    await firebaseDb.ref('analytics/visits')
      .transaction(function(n) { return (n || 0) + 1; });
  } catch (_) { /* fail silently */ }
}

/**
 * @description Records which election stage was expanded
 * @param {string} stageName - Name of the clicked stage
 * @param {number} stageNumber - Stage number 1-7
 * @returns {Promise<void>}
 */
async function recordStageView(stageName, stageNumber) {
  if (!firebaseInitialized || !firebaseDb) return;
  try {
    const key = 'stage_' + stageNumber;
    await firebaseDb.ref('analytics/stages/' + key)
      .transaction(function(n) { return (n || 0) + 1; });
  } catch (_) { /* fail silently */ }
}

/**
 * @description Records anonymous chatbot query count
 * @returns {Promise<void>}
 */
async function recordChatbotQuery() {
  if (!firebaseInitialized || !firebaseDb) return;
  try {
    await firebaseDb.ref('analytics/chatbot_queries')
      .transaction(function(n) { return (n || 0) + 1; });
  } catch (_) { /* fail silently */ }
}

/**
 * @description Records eligibility check result anonymously
 * @param {string} result - Result category shown to user
 * @returns {Promise<void>}
 */
async function recordEligibilityResult(result) {
  if (!firebaseInitialized || !firebaseDb) return;
  try {
    const key = result.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await firebaseDb.ref('analytics/eligibility/' + key)
      .transaction(function(n) { return (n || 0) + 1; });
  } catch (_) { /* fail silently */ }
}

/**
 * @description Gets current live visitor count for display
 * @returns {Promise<number>} Visit count or 0 on failure
 */
async function getVisitCount() {
  if (!firebaseInitialized || !firebaseDb) return 0;
  try {
    const snap = await firebaseDb
      .ref('analytics/visits').once('value');
    return snap.val() || 0;
  } catch (_) { return 0; }
}
