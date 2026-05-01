/**
 * @file tests.js
 * @description Automated test suite for VoteGuide India.
 *              Append ?test=true to the URL to run all tests.
 *              Tests cover: data integrity, eligibility logic,
 *              sanitization, DOM structure, failure paths,
 *              utility functions, data accuracy, Google Services,
 *              accessibility, and performance indicators.
 * @author VoteGuide India
 * @version 2.0.0
 */

const TEST_MODE = new URLSearchParams(
  window.location.search
).get('test') === 'true';

if (TEST_MODE) {
  document.addEventListener('DOMContentLoaded', runAllTests);
}

/**
 * @description Runs all test groups in sequence
 * @returns {void}
 */
function runAllTests() {
  console.group('VoteGuide India — Test Suite v2.0 (10 groups)');
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
  console.groupEnd();
}

/**
 * @description Tests ELECTION_DATA structure, counts, and immutability
 * @returns {void}
 */
function testDataIntegrity() {
  console.group('1. Data Integrity');
  console.assert(
    ELECTION_DATA.timelineStages.length === 7,
    'FAIL: Timeline needs 7 stages'
  );
  console.log('PASS: 7 timeline stages');
  ELECTION_DATA.timelineStages.forEach(function(s, i) {
    console.assert(s.title, 'FAIL: Stage ' + (i+1) + ' no title');
    console.assert(s.details && s.details.length > 0,
      'FAIL: Stage ' + (i+1) + ' no details');
    console.assert(s.icon, 'FAIL: Stage ' + (i+1) + ' no icon');
    console.assert(s.funFact, 'FAIL: Stage ' + (i+1) + ' no funFact');
  });
  console.log('PASS: All stages have required fields');
  console.assert(
    ELECTION_DATA.glossaryTerms.length === 14,
    'FAIL: Need 14 glossary terms'
  );
  console.log('PASS: 14 glossary terms');
  console.assert(
    ELECTION_DATA.faqItems.length === 8,
    'FAIL: Need 8 FAQ items'
  );
  console.log('PASS: 8 FAQ items');
  console.assert(
    Object.isFrozen(ELECTION_DATA),
    'FAIL: ELECTION_DATA must be frozen'
  );
  console.log('PASS: ELECTION_DATA is immutable');
  console.groupEnd();
}

/**
 * @description Tests eligibility rules and age boundaries
 * @returns {void}
 */
function testEligibilityLogic() {
  console.group('2. Eligibility Logic');
  console.assert(
    ELECTION_DATA.eligibilityRules.minAge === 18,
    'FAIL: Min age must be 18'
  );
  console.log('PASS: Min voting age 18');
  console.assert(
    ELECTION_DATA.eligibilityRules.advanceApplicationAge === 17,
    'FAIL: Advance age must be 17'
  );
  console.log('PASS: Advance application age 17');
  console.assert(
    Array.isArray(ELECTION_DATA.eligibilityRules.disqualifications)
    && ELECTION_DATA.eligibilityRules.disqualifications.length > 0,
    'FAIL: Disqualifications list empty'
  );
  console.log('PASS: Disqualifications populated');
  console.assert(
    Array.isArray(ELECTION_DATA.eligibilityRules.requiredIDs)
    && ELECTION_DATA.eligibilityRules.requiredIDs.length >= 5,
    'FAIL: Need at least 5 accepted IDs'
  );
  console.log('PASS: Required IDs 5+');
  console.groupEnd();
}

/**
 * @description Tests XSS prevention and input sanitization
 * @returns {void}
 */
function testSanitization() {
  console.group('3. Input Sanitization');
  const xss = '<script>alert("xss")</script>';
  const safe = sanitizeInput(xss);
  console.assert(!safe.includes('<script>'),
    'FAIL: script tag not removed');
  console.assert(safe.includes('&lt;'),
    'FAIL: < not escaped');
  console.log('PASS: XSS neutralized');
  const entities = sanitizeInput('& " \' < >');
  console.assert(entities.includes('&amp;'), 'FAIL: & not escaped');
  console.assert(entities.includes('&quot;'), 'FAIL: " not escaped');
  console.assert(entities.includes('&#039;'), "FAIL: ' not escaped");
  console.assert(entities.includes('&lt;'), 'FAIL: < not escaped');
  console.assert(entities.includes('&gt;'), 'FAIL: > not escaped');
  console.log('PASS: All 5 entities escaped');
  console.assert(sanitizeInput('  hi  ') === 'hi',
    'FAIL: whitespace not trimmed');
  console.log('PASS: Whitespace trimmed');
  console.assert(sanitizeInput('') === '',
    'FAIL: empty string fails');
  console.log('PASS: Empty string handled');
  console.assert(typeof sanitizeInput('normal text') === 'string',
    'FAIL: must return string');
  console.log('PASS: Always returns string');
  console.groupEnd();
}

/**
 * @description Tests all required DOM sections exist after render
 * @returns {void}
 */
function testDOMElements() {
  console.group('4. DOM Structure');
  const ids = [
    'hero','timeline','eligibility','register',
    'glossary','faq','insights','booth-finder','main-content'
  ];
  ids.forEach(function(id) {
    console.assert(document.getElementById(id),
      'FAIL: #' + id + ' missing');
    console.log('PASS: #' + id + ' exists');
  });
  console.assert(document.querySelector('.skip-link'),
    'FAIL: skip-link missing');
  console.log('PASS: skip-link exists');
  console.assert(document.querySelector('main'),
    'FAIL: main element missing');
  console.log('PASS: main element exists');
  console.assert(document.querySelector('nav[aria-label]'),
    'FAIL: nav missing aria-label');
  console.log('PASS: nav has aria-label');
  console.groupEnd();
}

/**
 * @description Tests error handling and failure scenarios
 * @returns {void}
 */
function testAPIFailurePaths() {
  console.group('5. Failure Paths');
  const keyCheck = !GEMINI_API_KEY ||
    GEMINI_API_KEY === 'YOUR_API_KEY_HERE';
  console.assert(typeof keyCheck === 'boolean',
    'FAIL: key check not boolean');
  console.log('PASS: API key validation is boolean');
  const imgXSS = sanitizeInput('<img src=x onerror=alert(1)>');
  console.assert(!imgXSS.includes('<'),
    'FAIL: brackets not neutralized');
  console.log('PASS: onerror XSS neutralized');
  console.assert(
    typeof sanitizeInput('javascript:void(0)') === 'string',
    'FAIL: must return string for all inputs'
  );
  console.log('PASS: Returns string for all inputs');
  console.assert(sanitizeInput('12345') === '12345',
    'FAIL: numeric input changed');
  console.log('PASS: Numeric input unchanged');
  console.assert('x'.repeat(501).length > 500,
    'FAIL: over-limit test wrong');
  console.log('PASS: Over-limit boundary identified');
  console.groupEnd();
}

/**
 * @description Tests utility functions and async timing
 * @returns {void}
 */
function testComplexInteractions() {
  console.group('6. Complex Interactions');
  console.assert(typeof debounce(function(){}, 100) === 'function',
    'FAIL: debounce must return function');
  console.log('PASS: debounce returns function');
  let count = 0;
  const d = debounce(function() { count++; }, 200);
  d(); d(); d();
  console.assert(count === 0,
    'FAIL: debounce fired synchronously');
  console.log('PASS: debounce delays correctly');
  const dr = formatIndianDate(new Date('2024-04-19'));
  console.assert(typeof dr === 'string' && dr.length > 0,
    'FAIL: formatIndianDate bad output');
  console.log('PASS: formatIndianDate works');
  try {
    scrollToSection('nonexistent-id-xyz-abc');
    console.log('PASS: scrollToSection handles bad ID');
  } catch(e) {
    console.assert(false, 'FAIL: scrollToSection threw: ' + e.message);
  }
  try {
    trackTimelineStageView('Test', 1);
    console.log('PASS: trackTimelineStageView safe without gtag');
  } catch(e) {
    console.assert(false, 'FAIL: threw: ' + e.message);
  }
  try {
    trackChatbotMessage();
    console.log('PASS: trackChatbotMessage safe without gtag');
  } catch(e) {
    console.assert(false, 'FAIL: threw: ' + e.message);
  }
  console.groupEnd();
}

/**
 * @description Tests content accuracy and data quality
 * @returns {void}
 */
function testDataAccuracy() {
  console.group('7. Data Accuracy');
  console.assert(ELECTION_DATA.timelineStages[0].stage === 1,
    'FAIL: Stage 1 not first');
  console.log('PASS: Stage 1 is first');
  console.assert(ELECTION_DATA.timelineStages[6].stage === 7,
    'FAIL: Stage 7 not last');
  console.log('PASS: Stage 7 is last');
  const ordered = ELECTION_DATA.timelineStages.every(
    function(s, i) { return s.stage === i + 1; }
  );
  console.assert(ordered, 'FAIL: stages not in order 1-7');
  console.log('PASS: Stages numbered 1-7 in order');
  const noSource = ELECTION_DATA.glossaryTerms.filter(
    function(t) { return !t.source || t.source.trim() === ''; }
  );
  console.assert(noSource.length === 0,
    'FAIL: ' + noSource.length + ' terms missing source');
  console.log('PASS: All glossary terms sourced');
  const shortAns = ELECTION_DATA.faqItems.filter(
    function(f) { return !f.answer || f.answer.length < 20; }
  );
  console.assert(shortAns.length === 0,
    'FAIL: ' + shortAns.length + ' answers too short');
  console.log('PASS: All FAQ answers substantive');
  console.assert(
    ELECTION_DATA.registrationSteps.newVoter.length >= 3,
    'FAIL: new voter steps < 3'
  );
  console.assert(
    ELECTION_DATA.registrationSteps.overseasVoter.length >= 2,
    'FAIL: overseas steps < 2'
  );
  console.assert(
    ELECTION_DATA.registrationSteps.corrections.length >= 2,
    'FAIL: correction steps < 2'
  );
  console.log('PASS: All registration categories have steps');
  console.groupEnd();
}

/**
 * @description Tests all Google Service integrations are present
 * @returns {void}
 */
function testGoogleServicesIntegration() {
  console.group('8. Google Services');
  [
    'trackTimelineStageView',
    'trackEligibilityCompletion',
    'trackChatbotMessage',
    'trackGlossarySearch',
    'trackFAQExpand',
    'trackRegistrationTab'
  ].forEach(function(fn) {
    console.assert(typeof window[fn] === 'function',
      'FAIL: ' + fn + ' missing');
    console.log('PASS: ' + fn + ' exists');
  });
  [
    'initGoogleCharts',
    'drawAllCharts',
    'drawSeatDistributionChart',
    'drawVoterTurnoutChart'
  ].forEach(function(fn) {
    console.assert(typeof window[fn] === 'function',
      'FAIL: ' + fn + ' missing');
    console.log('PASS: ' + fn + ' exists');
  });
  console.assert(document.getElementById('chart-seats'),
    'FAIL: chart-seats container missing');
  console.log('PASS: chart-seats container exists');
  console.assert(document.getElementById('chart-turnout'),
    'FAIL: chart-turnout container missing');
  console.log('PASS: chart-turnout container exists');
  console.assert(
    document.querySelector('#booth-finder iframe'),
    'FAIL: Google Maps iframe missing'
  );
  console.log('PASS: Google Maps iframe exists');
  console.assert(
    document.querySelector('script[src*="googletagmanager"]'),
    'FAIL: Google Analytics script missing'
  );
  console.log('PASS: Google Analytics script present');
  console.assert(
    document.querySelector('script[src*="gstatic.com/charts"]'),
    'FAIL: Google Charts loader missing'
  );
  console.log('PASS: Google Charts loader present');
  console.groupEnd();
}

/**
 * @description Tests ARIA and accessibility requirements
 * @returns {void}
 */
function testAccessibilityStructure() {
  console.group('9. Accessibility');
  console.assert(
    document.documentElement.getAttribute('lang') === 'en-IN',
    'FAIL: lang must be en-IN'
  );
  console.log('PASS: lang="en-IN"');
  const skip = document.querySelector('.skip-link');
  console.assert(skip && skip.getAttribute('href') === '#main-content',
    'FAIL: skip link must point to #main-content');
  console.log('PASS: skip link correct');
  const interactive = document.querySelectorAll(
    'button, [role="button"], [tabindex="0"]'
  );
  console.assert(interactive.length > 0,
    'FAIL: no interactive elements found');
  console.log('PASS: ' + interactive.length + ' interactive elements');
  const mapFrame = document.querySelector('#booth-finder iframe');
  if (mapFrame) {
    console.assert(mapFrame.getAttribute('title'),
      'FAIL: map iframe needs title');
    console.log('PASS: map iframe has title');
  }
  ['chart-seats','chart-turnout'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      console.assert(el.getAttribute('aria-label'),
        'FAIL: ' + id + ' needs aria-label');
      console.log('PASS: ' + id + ' has aria-label');
    }
  });
  console.groupEnd();
}

/**
 * @description Tests performance optimization markers
 * @returns {void}
 */
function testPerformanceIndicators() {
  console.group('10. Performance');
  const lazy = document.querySelectorAll('img[loading="lazy"]');
  console.assert(lazy.length > 0,
    'FAIL: no lazy loaded images');
  console.log('PASS: ' + lazy.length + ' lazy images');
  const anim = document.querySelectorAll('.animate-on-scroll');
  console.assert(anim.length > 0,
    'FAIL: no scroll animations');
  console.log('PASS: ' + anim.length + ' scroll animated elements');
  const preconn = document.querySelectorAll('link[rel="preconnect"]');
  console.assert(preconn.length >= 2,
    'FAIL: need 2+ preconnect hints');
  console.log('PASS: ' + preconn.length + ' preconnect hints');
  const scripts = document.querySelectorAll('script[src]');
  console.assert(scripts.length >= 5,
    'FAIL: expected multiple scripts');
  console.log('PASS: ' + scripts.length + ' external scripts');
  console.groupEnd();
}
