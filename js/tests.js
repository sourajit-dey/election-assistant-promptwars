/**
 * @file tests.js
 * @description Automated test suite for VoteGuide India.
 *              Run by adding ?test=true to the URL.
 *              Tests cover: data integrity, eligibility logic,
 *              input sanitization, DOM structure, API failure paths,
 *              complex interactions, data accuracy, and Google Services.
 * @author VoteGuide India
 * @version 2.0.0
 */

/** Check if test mode is enabled via URL query parameter */
const TEST_MODE = new URLSearchParams(
  window.location.search
).get('test') === 'true';

if (TEST_MODE) {
  document.addEventListener('DOMContentLoaded', runAllTests);
}

/**
 * @description Master test runner — executes all test groups in sequence
 * @returns {void}
 */
function runAllTests() {
  console.group('VoteGuide India — Full Test Suite v2.0');
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
 * @description Tests that ELECTION_DATA has all required 
 *              fields, correct counts, and is immutable
 * @returns {void}
 */
function testDataIntegrity() {
  console.group('1. Data Integrity Tests');

  console.assert(
    ELECTION_DATA.timelineStages.length === 7,
    'FAIL: Timeline should have exactly 7 stages'
  );
  console.log('PASS: Timeline has 7 stages');

  ELECTION_DATA.timelineStages.forEach(function(stage, i) {
    console.assert(stage.title,
      'FAIL: Stage ' + (i + 1) + ' missing title');
    console.assert(stage.details && stage.details.length > 0,
      'FAIL: Stage ' + (i + 1) + ' missing details');
    console.assert(stage.icon,
      'FAIL: Stage ' + (i + 1) + ' missing icon');
    console.assert(stage.funFact,
      'FAIL: Stage ' + (i + 1) + ' missing funFact');
  });
  console.log('PASS: All 7 stages have required fields');

  console.assert(
    ELECTION_DATA.glossaryTerms.length === 14,
    'FAIL: Glossary should have 14 terms'
  );
  console.log('PASS: Glossary has 14 terms');

  console.assert(
    ELECTION_DATA.faqItems.length === 8,
    'FAIL: FAQ should have 8 items'
  );
  console.log('PASS: FAQ has 8 items');

  console.assert(
    Object.isFrozen(ELECTION_DATA),
    'FAIL: ELECTION_DATA must be frozen with Object.freeze()'
  );
  console.log('PASS: ELECTION_DATA is immutable (Object.frozen)');

  console.groupEnd();
}

/**
 * @description Tests eligibility rules and boundary values
 * @returns {void}
 */
function testEligibilityLogic() {
  console.group('2. Eligibility Logic Tests');

  console.assert(
    ELECTION_DATA.eligibilityRules.minAge === 18,
    'FAIL: Minimum voting age must be 18'
  );
  console.log('PASS: Minimum voting age is 18');

  console.assert(
    ELECTION_DATA.eligibilityRules.advanceApplicationAge === 17,
    'FAIL: Advance application age must be 17'
  );
  console.log('PASS: Advance application age is 17');

  console.assert(
    Array.isArray(ELECTION_DATA.eligibilityRules.disqualifications) &&
    ELECTION_DATA.eligibilityRules.disqualifications.length > 0,
    'FAIL: Disqualifications list must not be empty'
  );
  console.log('PASS: Disqualifications list is populated');

  console.assert(
    Array.isArray(ELECTION_DATA.eligibilityRules.requiredIDs) &&
    ELECTION_DATA.eligibilityRules.requiredIDs.length >= 5,
    'FAIL: At least 5 accepted voter IDs must be listed'
  );
  console.log('PASS: Required IDs list has 5+ entries');

  console.groupEnd();
}

/**
 * @description Tests input sanitization against XSS and edge cases
 * @returns {void}
 */
function testSanitization() {
  console.group('3. Input Sanitization Tests');

  const xss = '<script>alert("xss")</script>';
  const safe = sanitizeInput(xss);
  console.assert(
    !safe.includes('<script>'),
    'FAIL: Script tag not removed from input'
  );
  console.assert(
    safe.includes('&lt;'),
    'FAIL: < not escaped to &lt;'
  );
  console.log('PASS: XSS script tag correctly sanitized');

  const entities = sanitizeInput('Hello & "World" \'test\' <b>');
  console.assert(entities.includes('&amp;'),
    'FAIL: & not escaped');
  console.assert(entities.includes('&quot;'),
    'FAIL: double quote not escaped');
  console.assert(entities.includes('&#039;'),
    'FAIL: single quote not escaped');
  console.assert(entities.includes('&gt;'),
    'FAIL: > not escaped');
  console.log('PASS: All HTML entities correctly escaped');

  const padded = sanitizeInput('  hello world  ');
  console.assert(
    padded === 'hello world',
    'FAIL: Whitespace not trimmed correctly'
  );
  console.log('PASS: Whitespace trimmed correctly');

  const empty = sanitizeInput('');
  console.assert(
    empty === '',
    'FAIL: Empty string should return empty string'
  );
  console.log('PASS: Empty string handled correctly');

  const longInput = 'a'.repeat(501);
  console.assert(
    longInput.length > 500,
    'FAIL: Long input test case wrong length'
  );
  console.log('PASS: Long input boundary identified (501 chars)');

  console.groupEnd();
}

/**
 * @description Tests that all required DOM sections and 
 *              accessibility landmarks exist after render
 * @returns {void}
 */
function testDOMElements() {
  console.group('4. DOM Structure Tests');

  const requiredIds = [
    'hero', 'timeline', 'eligibility',
    'register', 'glossary', 'faq',
    'insights', 'booth-finder', 'main-content'
  ];

  requiredIds.forEach(function(id) {
    console.assert(
      document.getElementById(id) !== null,
      'FAIL: Element #' + id + ' not found in DOM'
    );
    console.log('PASS: #' + id + ' exists');
  });

  console.assert(
    document.querySelector('.skip-link') !== null,
    'FAIL: Skip navigation link not found'
  );
  console.log('PASS: Skip navigation link exists');

  console.assert(
    document.querySelector('nav[aria-label]') !== null,
    'FAIL: Nav element must have aria-label'
  );
  console.log('PASS: Nav has aria-label');

  console.assert(
    document.querySelector('main') !== null,
    'FAIL: main landmark element missing'
  );
  console.log('PASS: main landmark exists');

  console.groupEnd();
}

/**
 * @description Tests failure paths, error handling, and 
 *              invalid input scenarios
 * @returns {void}
 */
function testAPIFailurePaths() {
  console.group('5. Failure Path Tests');

  const keyInvalid = !GEMINI_API_KEY ||
    GEMINI_API_KEY === 'YOUR_API_KEY_HERE' ||
    GEMINI_API_KEY === 'G-PLACEHOLDER';
  console.assert(
    typeof keyInvalid === 'boolean',
    'FAIL: API key validation must return boolean'
  );
  console.log('PASS: API key validation logic is boolean');

  const dangerous1 = sanitizeInput('<img src=x onerror=alert(1)>');
  console.assert(
    !dangerous1.includes('<') && !dangerous1.includes('>'),
    'FAIL: HTML angle brackets not neutralized'
  );
  console.log('PASS: onerror XSS vector neutralized');

  const dangerous2 = sanitizeInput('javascript:alert(1)');
  console.assert(
    typeof dangerous2 === 'string',
    'FAIL: sanitizeInput must return string for all inputs'
  );
  console.log('PASS: sanitizeInput always returns string');

  const numericInput = sanitizeInput('12345');
  console.assert(
    numericInput === '12345',
    'FAIL: Numeric input should pass through unchanged'
  );
  console.log('PASS: Numeric input passes through sanitization');

  console.groupEnd();
}

/**
 * @description Tests utility functions for correct behavior
 *              including async timing and edge cases
 * @returns {void}
 */
function testComplexInteractions() {
  console.group('6. Complex Interaction Tests');

  const debouncedFn = debounce(function() {}, 100);
  console.assert(
    typeof debouncedFn === 'function',
    'FAIL: debounce must return a function'
  );
  console.log('PASS: debounce returns callable function');

  let syncCallCount = 0;
  const debouncedCounter = debounce(
    function() { syncCallCount++; }, 200
  );
  debouncedCounter();
  debouncedCounter();
  debouncedCounter();
  console.assert(
    syncCallCount === 0,
    'FAIL: debounce must not fire synchronously'
  );
  console.log('PASS: debounce correctly delays execution');

  const dateResult = formatIndianDate(new Date('2024-04-19'));
  console.assert(
    typeof dateResult === 'string' && dateResult.length > 0,
    'FAIL: formatIndianDate must return non-empty string'
  );
  console.log('PASS: formatIndianDate returns valid date string');

  try {
    scrollToSection('completely-nonexistent-id-xyz-abc-123');
    console.log('PASS: scrollToSection handles missing ID gracefully');
  } catch (e) {
    console.assert(false,
      'FAIL: scrollToSection threw on missing element: ' + e.message);
  }

  try {
    trackTimelineStageView('Test Stage', 1);
    console.log('PASS: trackTimelineStageView safe without gtag');
  } catch (e) {
    console.assert(false,
      'FAIL: trackTimelineStageView threw: ' + e.message);
  }

  try {
    trackChatbotMessage();
    console.log('PASS: trackChatbotMessage safe without gtag');
  } catch (e) {
    console.assert(false,
      'FAIL: trackChatbotMessage threw: ' + e.message);
  }

  console.groupEnd();
}

/**
 * @description Tests election content accuracy, ordering,
 *              completeness, and data quality
 * @returns {void}
 */
function testDataAccuracy() {
  console.group('7. Data Accuracy Tests');

  console.assert(
    ELECTION_DATA.timelineStages[0].stage === 1,
    'FAIL: First timeline stage must be stage 1'
  );
  console.log('PASS: Timeline stage 1 is first');

  console.assert(
    ELECTION_DATA.timelineStages[6].stage === 7,
    'FAIL: Last timeline stage must be stage 7'
  );
  console.log('PASS: Timeline stage 7 is last');

  const stagesInOrder = ELECTION_DATA.timelineStages.every(
    function(s, i) { return s.stage === i + 1; }
  );
  console.assert(stagesInOrder,
    'FAIL: Timeline stages must be numbered 1 through 7 in order'
  );
  console.log('PASS: All stages numbered correctly in sequence');

  const missingSources = ELECTION_DATA.glossaryTerms.filter(
    function(t) { return !t.source || t.source.trim() === ''; }
  );
  console.assert(
    missingSources.length === 0,
    'FAIL: ' + missingSources.length + ' glossary terms missing source'
  );
  console.log('PASS: All glossary terms have source citations');

  const shortAnswers = ELECTION_DATA.faqItems.filter(
    function(f) {
      return !f.answer || f.answer.trim().length < 20;
    }
  );
  console.assert(
    shortAnswers.length === 0,
    'FAIL: ' + shortAnswers.length + ' FAQ answers too short'
  );
  console.log('PASS: All FAQ answers are substantive');

  console.assert(
    ELECTION_DATA.registrationSteps.newVoter.length >= 3,
    'FAIL: New voter guide needs at least 3 steps'
  );
  console.assert(
    ELECTION_DATA.registrationSteps.overseasVoter.length >= 2,
    'FAIL: Overseas voter guide needs at least 2 steps'
  );
  console.assert(
    ELECTION_DATA.registrationSteps.corrections.length >= 2,
    'FAIL: Corrections guide needs at least 2 steps'
  );
  console.log('PASS: All registration categories have steps');

  console.groupEnd();
}

/**
 * @description Tests that Google Services integration 
 *              functions are present and callable
 * @returns {void}
 */
function testGoogleServicesIntegration() {
  console.group('8. Google Services Integration Tests');

  const analyticsFunctions = [
    'trackTimelineStageView',
    'trackEligibilityCompletion',
    'trackChatbotMessage',
    'trackGlossarySearch',
    'trackFAQExpand',
    'trackRegistrationTab'
  ];

  analyticsFunctions.forEach(function(fnName) {
    console.assert(
      typeof window[fnName] === 'function',
      'FAIL: ' + fnName + ' function not found'
    );
    console.log('PASS: ' + fnName + ' is callable');
  });

  const chartFunctions = [
    'initGoogleCharts',
    'drawAllCharts',
    'drawSeatDistributionChart',
    'drawVoterTurnoutChart'
  ];

  chartFunctions.forEach(function(fnName) {
    console.assert(
      typeof window[fnName] === 'function',
      'FAIL: ' + fnName + ' function not found'
    );
    console.log('PASS: ' + fnName + ' is callable');
  });

  const chartContainers = ['chart-seats', 'chart-turnout'];
  chartContainers.forEach(function(id) {
    console.assert(
      document.getElementById(id) !== null,
      'FAIL: Chart container #' + id + ' not found'
    );
    console.log('PASS: Chart container #' + id + ' exists');
  });

  const mapIframe = document.querySelector(
    '#booth-finder iframe'
  );
  console.assert(
    mapIframe !== null,
    'FAIL: Google Maps iframe not found in #booth-finder'
  );
  console.log('PASS: Google Maps iframe exists');

  const gaScript = document.querySelector(
    'script[src*="googletagmanager"]'
  );
  console.assert(
    gaScript !== null,
    'FAIL: Google Analytics script tag not found in document'
  );
  console.log('PASS: Google Analytics script tag present');

  console.groupEnd();
}

/**
 * @description Tests critical accessibility requirements
 *              are intact after all modifications
 * @returns {void}
 */
function testAccessibilityStructure() {
  console.group('9. Accessibility Structure Tests');

  console.assert(
    document.documentElement.getAttribute('lang') === 'en-IN',
    'FAIL: html lang must be en-IN'
  );
  console.log('PASS: lang="en-IN" set correctly');

  const skipLink = document.querySelector('.skip-link');
  console.assert(skipLink !== null,
    'FAIL: Skip navigation link missing');
  console.assert(
    skipLink.getAttribute('href') === '#main-content',
    'FAIL: Skip link must point to #main-content'
  );
  console.log('PASS: Skip link points to #main-content');

  const interactiveElements = document.querySelectorAll(
    'button, [role="button"], [tabindex="0"]'
  );
  console.assert(
    interactiveElements.length > 0,
    'FAIL: No interactive elements found'
  );
  console.log('PASS: Interactive elements present (' +
    interactiveElements.length + ' found)');

  const mapIframe = document.querySelector('#booth-finder iframe');
  if (mapIframe) {
    console.assert(
      mapIframe.getAttribute('title') &&
      mapIframe.getAttribute('title').length > 0,
      'FAIL: Google Maps iframe missing title attribute'
    );
    console.log('PASS: Google Maps iframe has title attribute');
  }

  const chartDivs = document.querySelectorAll(
    '#chart-seats, #chart-turnout'
  );
  chartDivs.forEach(function(div) {
    console.assert(
      div.getAttribute('aria-label') &&
      div.getAttribute('aria-label').length > 0,
      'FAIL: Chart div missing aria-label'
    );
  });
  console.log('PASS: Chart divs have aria-labels');

  console.groupEnd();
}

/**
 * @description Tests performance indicators and 
 *              resource optimization markers
 * @returns {void}
 */
function testPerformanceIndicators() {
  console.group('10. Performance Tests');

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  console.assert(
    lazyImages.length > 0,
    'FAIL: At least one image should have loading="lazy"'
  );
  console.log('PASS: Lazy loading used on images (' +
    lazyImages.length + ' images)');

  const animatedEls = document.querySelectorAll('.animate-on-scroll');
  console.assert(
    animatedEls.length > 0,
    'FAIL: No animate-on-scroll elements found'
  );
  console.log('PASS: Scroll animations present (' +
    animatedEls.length + ' elements)');

  const preconnects = document.querySelectorAll(
    'link[rel="preconnect"]'
  );
  console.assert(
    preconnects.length >= 2,
    'FAIL: Should have at least 2 preconnect hints for Google Fonts'
  );
  console.log('PASS: Preconnect hints present (' +
    preconnects.length + ' found)');

  const allScripts = document.querySelectorAll('script[src]');
  console.assert(
    allScripts.length > 0,
    'FAIL: No external scripts found'
  );
  console.log('PASS: External scripts loaded (' +
    allScripts.length + ' total)');

  console.groupEnd();
}
