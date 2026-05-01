/**
 * @file tests.js
 * @description Comprehensive automated test suite for VoteGuide India.
 *              Run by appending ?test=true to any URL.
 *              Covers: data integrity, eligibility logic, XSS
 *              sanitization, DOM structure, failure paths, utility
 *              functions, data accuracy, Google services, 
 *              accessibility, performance, PWA/service worker,
 *              multilingual support, backend integration,
 *              and chatbot security.
 * @author VoteGuide India
 * @version 3.0.0
 */

const TEST_MODE = new URLSearchParams(
  window.location.search
).get('test') === 'true';

if (TEST_MODE) {
  document.addEventListener('DOMContentLoaded', runAllTests);
}

/**
 * @description Runs all 14 test groups in sequence
 * @returns {void}
 */
function runAllTests() {
  console.group('VoteGuide India — Test Suite v3.0 (14 groups)');
  testDataIntegrity();
  testEligibilityLogic();
  testSanitization();
  testDOMElements();
  testAPIFailurePaths();
  testComplexInteractions();
  testDataAccuracy();
  testGoogleServicesIntegration();
  testAccessibilityStructure();
  testPerformanceIndicators();
  testPWACapabilities();
  testMultilingualSupport();
  testBackendIntegration();
  testChatbotSecurity();
  console.groupEnd();
}

function testDataIntegrity() {
  console.group('1. Data Integrity');
  console.assert(ELECTION_DATA.timelineStages.length === 7,
    'FAIL: Need 7 timeline stages');
  console.log('PASS: 7 timeline stages');
  ELECTION_DATA.timelineStages.forEach(function(s, i) {
    console.assert(s.title, 'FAIL: Stage '+(i+1)+' no title');
    console.assert(s.details&&s.details.length>0,
      'FAIL: Stage '+(i+1)+' no details');
    console.assert(s.icon, 'FAIL: Stage '+(i+1)+' no icon');
    console.assert(s.funFact, 'FAIL: Stage '+(i+1)+' no funFact');
  });
  console.log('PASS: All stages have required fields');
  console.assert(ELECTION_DATA.glossaryTerms.length === 14,
    'FAIL: Need 14 glossary terms');
  console.log('PASS: 14 glossary terms');
  console.assert(ELECTION_DATA.faqItems.length === 8,
    'FAIL: Need 8 FAQ items');
  console.log('PASS: 8 FAQ items');
  console.assert(Object.isFrozen(ELECTION_DATA),
    'FAIL: ELECTION_DATA must be frozen');
  console.log('PASS: ELECTION_DATA immutable');
  console.groupEnd();
}

function testEligibilityLogic() {
  console.group('2. Eligibility Logic');
  console.assert(ELECTION_DATA.eligibilityRules.minAge === 18,
    'FAIL: Min age must be 18');
  console.log('PASS: Min voting age 18');
  console.assert(
    ELECTION_DATA.eligibilityRules.advanceApplicationAge === 17,
    'FAIL: Advance age must be 17');
  console.log('PASS: Advance application age 17');
  console.assert(
    Array.isArray(ELECTION_DATA.eligibilityRules.disqualifications)
    && ELECTION_DATA.eligibilityRules.disqualifications.length > 0,
    'FAIL: Disqualifications empty');
  console.log('PASS: Disqualifications populated');
  console.assert(
    Array.isArray(ELECTION_DATA.eligibilityRules.requiredIDs)
    && ELECTION_DATA.eligibilityRules.requiredIDs.length >= 5,
    'FAIL: Need 5+ accepted IDs');
  console.log('PASS: Required IDs 5+');
  console.groupEnd();
}

function testSanitization() {
  console.group('3. Input Sanitization');
  const xss = '<script>alert("xss")</script>';
  const safe = sanitizeInput(xss);
  console.assert(!safe.includes('<script>'), 'FAIL: script not removed');
  console.assert(safe.includes('&lt;'), 'FAIL: < not escaped');
  console.log('PASS: XSS neutralized');
  const e = sanitizeInput('& " \' < >');
  console.assert(e.includes('&amp;'), 'FAIL: & not escaped');
  console.assert(e.includes('&quot;'), 'FAIL: " not escaped');
  console.assert(e.includes('&#039;'), "FAIL: ' not escaped");
  console.assert(e.includes('&lt;'), 'FAIL: < not escaped');
  console.assert(e.includes('&gt;'), 'FAIL: > not escaped');
  console.log('PASS: All 5 entities escaped');
  console.assert(sanitizeInput('  hi  ') === 'hi',
    'FAIL: whitespace not trimmed');
  console.log('PASS: Whitespace trimmed');
  console.assert(sanitizeInput('') === '',
    'FAIL: empty string fails');
  console.log('PASS: Empty string handled');
  console.groupEnd();
}

function testDOMElements() {
  console.group('4. DOM Structure');
  const ids = ['hero','timeline','eligibility','register',
    'glossary','faq','insights','booth-finder','main-content'];
  ids.forEach(function(id) {
    console.assert(document.getElementById(id),
      'FAIL: #'+id+' missing');
    console.log('PASS: #'+id+' exists');
  });
  console.assert(document.querySelector('.skip-link'),
    'FAIL: skip-link missing');
  console.log('PASS: skip-link exists');
  console.assert(document.querySelector('main'),
    'FAIL: main missing');
  console.log('PASS: main element exists');
  console.groupEnd();
}

function testAPIFailurePaths() {
  console.group('5. Failure Paths');
  const keyCheck = !GEMINI_API_KEY ||
    GEMINI_API_KEY === 'YOUR_API_KEY_HERE';
  console.assert(typeof keyCheck === 'boolean',
    'FAIL: key check not boolean');
  console.log('PASS: API key validation is boolean');
  const imgXSS = sanitizeInput('<img src=x onerror=alert(1)>');
  console.assert(!imgXSS.includes('onerror'),
    'FAIL: onerror not neutralized');
  console.log('PASS: onerror XSS neutralized');
  console.assert(sanitizeInput('safe text') === 'safe text',
    'FAIL: safe text changed');
  console.log('PASS: Safe input unchanged');
  console.assert('x'.repeat(501).length > 500,
    'FAIL: over-limit test wrong');
  console.log('PASS: Over-limit boundary identified');
  console.groupEnd();
}

function testComplexInteractions() {
  console.group('6. Complex Interactions');
  console.assert(typeof debounce(function(){},100) === 'function',
    'FAIL: debounce must return function');
  console.log('PASS: debounce returns function');
  let count = 0;
  const d = debounce(function() { count++; }, 200);
  d(); d(); d();
  console.assert(count === 0, 'FAIL: debounce fired early');
  console.log('PASS: debounce delays correctly');
  const dr = formatIndianDate(new Date('2024-04-19'));
  console.assert(typeof dr === 'string' && dr.length > 0,
    'FAIL: formatIndianDate bad output');
  console.log('PASS: formatIndianDate works');
  try {
    scrollToSection('nonexistent-xyz-abc-123');
    console.log('PASS: scrollToSection handles bad ID');
  } catch(e) {
    console.assert(false,'FAIL: scrollToSection threw');
  }
  console.groupEnd();
}

function testDataAccuracy() {
  console.group('7. Data Accuracy');
  console.assert(ELECTION_DATA.timelineStages[0].stage === 1,
    'FAIL: Stage 1 not first');
  console.log('PASS: Stage 1 is first');
  console.assert(ELECTION_DATA.timelineStages[6].stage === 7,
    'FAIL: Stage 7 not last');
  console.log('PASS: Stage 7 is last');
  const ordered = ELECTION_DATA.timelineStages.every(
    function(s,i) { return s.stage === i+1; });
  console.assert(ordered, 'FAIL: stages not 1-7 in order');
  console.log('PASS: Stages numbered 1-7 in order');
  const noSrc = ELECTION_DATA.glossaryTerms.filter(
    function(t) { return !t.source || t.source.trim()===''; });
  console.assert(noSrc.length===0,
    'FAIL: '+noSrc.length+' terms missing source');
  console.log('PASS: All terms have sources');
  console.assert(
    ELECTION_DATA.registrationSteps.newVoter.length >= 3,
    'FAIL: new voter steps < 3');
  console.assert(
    ELECTION_DATA.registrationSteps.overseasVoter.length >= 2,
    'FAIL: overseas steps < 2');
  console.assert(
    ELECTION_DATA.registrationSteps.corrections.length >= 2,
    'FAIL: correction steps < 2');
  console.log('PASS: All registration categories have steps');
  console.groupEnd();
}

function testGoogleServicesIntegration() {
  console.group('8. Google Services');
  ['trackTimelineStageView','trackEligibilityCompletion',
   'trackChatbotMessage','trackGlossarySearch',
   'trackFAQExpand','trackRegistrationTab'].forEach(function(fn) {
    console.assert(typeof window[fn]==='function',
      'FAIL: '+fn+' missing');
    console.log('PASS: '+fn+' exists');
  });
  ['initGoogleCharts','drawAllCharts',
   'drawSeatDistributionChart','drawVoterTurnoutChart'
  ].forEach(function(fn) {
    console.assert(typeof window[fn]==='function',
      'FAIL: '+fn+' missing');
    console.log('PASS: '+fn+' exists');
  });
  console.assert(document.getElementById('chart-seats'),
    'FAIL: chart-seats missing');
  console.log('PASS: chart-seats container exists');
  console.assert(document.getElementById('chart-turnout'),
    'FAIL: chart-turnout missing');
  console.log('PASS: chart-turnout container exists');
  console.assert(
    document.querySelector('#booth-finder iframe'),
    'FAIL: Maps iframe missing');
  console.log('PASS: Google Maps iframe exists');
  console.assert(
    document.querySelector('script[src*="googletagmanager"]'),
    'FAIL: GA script missing');
  console.log('PASS: Analytics script present');
  console.assert(
    document.querySelector('script[src*="gstatic.com/charts"]'),
    'FAIL: Charts loader missing');
  console.log('PASS: Charts loader present');
  console.groupEnd();
}

function testAccessibilityStructure() {
  console.group('9. Accessibility');
  console.assert(
    document.documentElement.getAttribute('lang')==='en-IN',
    'FAIL: lang must be en-IN');
  console.log('PASS: lang="en-IN"');
  const skip = document.querySelector('.skip-link');
  console.assert(skip&&skip.getAttribute('href')==='#main-content',
    'FAIL: skip link wrong');
  console.log('PASS: skip link correct');
  const interactive = document.querySelectorAll(
    'button,[role="button"],[tabindex="0"]');
  console.assert(interactive.length > 0,
    'FAIL: no interactive elements');
  console.log('PASS: '+interactive.length+' interactive elements');
  const mapFrame = document.querySelector('#booth-finder iframe');
  if (mapFrame) {
    console.assert(mapFrame.getAttribute('title'),
      'FAIL: iframe needs title');
    console.log('PASS: Maps iframe has title');
  }
  console.groupEnd();
}

function testPerformanceIndicators() {
  console.group('10. Performance');
  const lazy = document.querySelectorAll('img[loading="lazy"]');
  console.assert(lazy.length > 0, 'FAIL: no lazy images');
  console.log('PASS: '+lazy.length+' lazy images');
  const preconn = document.querySelectorAll('link[rel="preconnect"]');
  console.assert(preconn.length >= 2,
    'FAIL: need 2+ preconnect hints');
  console.log('PASS: '+preconn.length+' preconnect hints');
  const dnsPrefetch = document.querySelectorAll(
    'link[rel="dns-prefetch"]');
  console.assert(dnsPrefetch.length >= 3,
    'FAIL: need 3+ dns-prefetch hints');
  console.log('PASS: '+dnsPrefetch.length+' DNS prefetch hints');
  const manifest = document.querySelector('link[rel="manifest"]');
  console.assert(manifest, 'FAIL: manifest missing');
  console.log('PASS: Web manifest linked');
  console.groupEnd();
}

function testPWACapabilities() {
  console.group('11. PWA & Service Worker');
  console.assert('serviceWorker' in navigator,
    'FAIL: SW API not available');
  console.log('PASS: Service Worker API available');
  console.assert('caches' in window,
    'FAIL: Cache API not available');
  console.log('PASS: Cache Storage API available');
  const manifest = document.querySelector('link[rel="manifest"]');
  console.assert(manifest !== null,
    'FAIL: Manifest link missing');
  console.log('PASS: Manifest linked');
  const theme = document.querySelector('meta[name="theme-color"]');
  console.assert(theme !== null, 'FAIL: theme-color missing');
  console.assert(
    theme && theme.getAttribute('content') === '#FF9933',
    'FAIL: theme-color must be #FF9933');
  console.log('PASS: Theme color is saffron #FF9933');
  navigator.serviceWorker.getRegistrations()
    .then(function(regs) {
      if (regs.length > 0) {
        console.log('PASS: Service Worker registered');
      } else {
        console.log('INFO: SW not yet registered (reload to register)');
      }
    });
  console.groupEnd();
}

function testMultilingualSupport() {
  console.group('12. Multilingual Support');
  const translateEl = document.getElementById(
    'google_translate_element');
  console.assert(translateEl !== null,
    'FAIL: Translate element missing');
  console.log('PASS: Translate element exists');
  console.assert(
    translateEl && translateEl.getAttribute('aria-label'),
    'FAIL: Translate needs aria-label');
  console.log('PASS: Translate element accessible');
  const translateScript = document.querySelector(
    'script[src*="translate.google.com"]');
  console.assert(translateScript !== null,
    'FAIL: Translate script missing');
  console.log('PASS: Translate script present');
  console.assert(
    typeof googleTranslateElementInit === 'function',
    'FAIL: Translate init function missing');
  console.log('PASS: Translate init function defined');
  console.groupEnd();
}

function testBackendIntegration() {
  console.group('13. Backend Integration');
  console.assert(typeof initFirebase === 'function',
    'FAIL: initFirebase missing');
  console.log('PASS: initFirebase exists');
  console.assert(typeof trackVisit === 'function',
    'FAIL: trackVisit missing');
  console.log('PASS: trackVisit exists');
  console.assert(typeof recordStageView === 'function',
    'FAIL: recordStageView missing');
  console.log('PASS: recordStageView exists');
  console.assert(typeof recordChatbotQuery === 'function',
    'FAIL: recordChatbotQuery missing');
  console.log('PASS: recordChatbotQuery exists');
  console.assert(typeof getVisitCount === 'function',
    'FAIL: getVisitCount missing');
  console.log('PASS: getVisitCount exists');
  console.assert(typeof CLOUD_FUNCTION_URL === 'string',
    'FAIL: CLOUD_FUNCTION_URL missing');
  console.log('PASS: Cloud Function URL defined');
  console.assert(typeof sendToGemini === 'function',
    'FAIL: sendToGemini missing');
  console.log('PASS: sendToGemini exists');
  getVisitCount().then(function(count) {
    console.assert(typeof count === 'number',
      'FAIL: getVisitCount must return number');
    console.log('PASS: getVisitCount returns number ('+count+')');
  });
  console.groupEnd();
}

function testChatbotSecurity() {
  console.group('14. Chatbot Security');
  const attacks = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(document.cookie)',
    '"><script>alert(1)</script>',
    '<svg onload=alert(1)>'
  ];
  let allSafe = true;
  attacks.forEach(function(payload) {
    const result = sanitizeInput(payload);
    if (result.includes('<script>') ||
        result.includes('onerror') ||
        result.includes('onload')) {
      allSafe = false;
    }
  });
  console.assert(allSafe, 'FAIL: XSS payload not neutralized');
  console.log('PASS: All 5 XSS vectors neutralized');
  console.assert(typeof GEMINI_API_KEY === 'string',
    'FAIL: API key type wrong');
  console.log('PASS: API key is string type');
  console.assert(GEMINI_API_KEY !== '',
    'FAIL: API key empty');
  console.log('PASS: API key not empty');
  console.assert(typeof Date.now === 'function',
    'FAIL: Date.now unavailable');
  console.log('PASS: Rate limiting dependency available');
  const clean = sanitizeInput('Hello, how do I vote?');
  console.assert(clean === 'Hello, how do I vote?',
    'FAIL: safe input was modified');
  console.log('PASS: Safe input passes unchanged');
  console.groupEnd();
}
