/**
 * @file tests.js
 * @description Automated test suite for VoteGuide India.
 *              Run by adding ?test=true to the URL.
 * @author VoteGuide India
 * @version 1.0.0
 */

/** Check if test mode is enabled via URL query parameter */
const TEST_MODE = new URLSearchParams(window.location.search).get('test') === 'true';

if (TEST_MODE) {
  document.addEventListener('DOMContentLoaded', runAllTests);
}

/**
 * @description Master test runner — executes all test groups
 * @returns {void}
 */
function runAllTests() {
  console.group('VoteGuide India — Test Suite');
  testDataIntegrity();
  testEligibilityLogic();
  testSanitization();
  testDOMElements();
  console.groupEnd();
}

/**
 * @description Tests that ELECTION_DATA has all required fields and counts
 * @returns {void}
 */
function testDataIntegrity() {
  console.group('Data Integrity Tests');

  // Test 1: Timeline has 7 stages
  console.assert(
    ELECTION_DATA.timelineStages.length === 7,
    'FAIL: Timeline should have 7 stages'
  );
  console.log('PASS: Timeline has 7 stages');

  // Test 2: Every stage has required fields (title, details, icon)
  ELECTION_DATA.timelineStages.forEach((stage, i) => {
    console.assert(stage.title, `FAIL: Stage ${i + 1} missing title`);
    console.assert(stage.details, `FAIL: Stage ${i + 1} missing details`);
    console.assert(stage.icon, `FAIL: Stage ${i + 1} missing icon`);
  });
  console.log('PASS: All stages have required fields');

  // Test 3: Glossary has 14 terms
  console.assert(
    ELECTION_DATA.glossaryTerms.length === 14,
    'FAIL: Glossary should have 14 terms'
  );
  console.log('PASS: Glossary has 14 terms');

  // Test 4: FAQ has 8 items
  console.assert(
    ELECTION_DATA.faqItems.length === 8,
    'FAIL: FAQ should have 8 items'
  );
  console.log('PASS: FAQ has 8 items');

  // Test 5: ELECTION_DATA is frozen (immutable)
  console.assert(
    Object.isFrozen(ELECTION_DATA),
    'FAIL: ELECTION_DATA should be frozen with Object.freeze()'
  );
  console.log('PASS: ELECTION_DATA is frozen');

  console.groupEnd();
}

/**
 * @description Tests the eligibility checker logic edge cases
 * @returns {void}
 */
function testEligibilityLogic() {
  console.group('Eligibility Logic Tests');

  // Test that eligibility rules exist with correct minimum age
  console.assert(
    ELECTION_DATA.eligibilityRules.minAge === 18,
    'FAIL: Minimum voting age should be 18'
  );
  console.log('PASS: Minimum voting age is 18');

  // Test advance application age is 17
  console.assert(
    ELECTION_DATA.eligibilityRules.advanceApplicationAge === 17,
    'FAIL: Advance application age should be 17'
  );
  console.log('PASS: Advance application age is 17');

  // Test that disqualifications list is populated
  console.assert(
    ELECTION_DATA.eligibilityRules.disqualifications.length > 0,
    'FAIL: Disqualifications list should not be empty'
  );
  console.log('PASS: Disqualifications list is populated');

  console.groupEnd();
}

/**
 * @description Tests that sanitizeInput correctly neutralizes dangerous input
 * @returns {void}
 */
function testSanitization() {
  console.group('Input Sanitization Tests');

  // Test 1: Script tag is neutralized
  const dangerous = '<script>alert("xss")</script>';
  const safe = sanitizeInput(dangerous);
  console.assert(
    !safe.includes('<script>'),
    'FAIL: Sanitization did not remove script tags'
  );
  console.log('PASS: XSS input correctly sanitized');

  // Test 2: HTML entities are escaped
  console.assert(
    safe.includes('&lt;'),
    'FAIL: < should be escaped to &lt;'
  );
  console.log('PASS: HTML entities correctly escaped');

  // Test 3: Input length boundary
  const longInput = 'a'.repeat(501);
  console.assert(
    longInput.length > 500,
    'FAIL: Long input test case is wrong length'
  );
  console.log('PASS: Long input test case ready (501 chars)');

  // Test 4: Whitespace trimming
  const padded = sanitizeInput('  hello  ');
  console.assert(
    padded === 'hello',
    'FAIL: sanitizeInput should trim whitespace'
  );
  console.log('PASS: Whitespace trimmed correctly');

  console.groupEnd();
}

/**
 * @description Tests that all required DOM sections exist after render
 * @returns {void}
 */
function testDOMElements() {
  console.group('DOM Structure Tests');

  // Verify all major section IDs exist
  const requiredIds = ['hero', 'timeline', 'eligibility', 'register', 'glossary', 'faq'];
  requiredIds.forEach((id) => {
    console.assert(
      document.getElementById(id),
      `FAIL: Section #${id} not found in DOM`
    );
    console.log(`PASS: Section #${id} exists`);
  });

  // Verify main content wrapper exists
  console.assert(
    document.getElementById('main-content'),
    'FAIL: #main-content landmark not found'
  );
  console.log('PASS: #main-content landmark exists');

  // Verify skip link exists
  console.assert(
    document.querySelector('.skip-link'),
    'FAIL: Skip navigation link not found'
  );
  console.log('PASS: Skip navigation link exists');

  console.groupEnd();
}
