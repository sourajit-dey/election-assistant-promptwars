/**
 * @file eligibility.js
 * @description Multi-step voter eligibility checker with input validation,
 *              progress indicators, and detailed result messages.
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * @description Builds and manages the 4-step eligibility checker wizard
 * @returns {void}
 */
function buildEligibilityChecker() {
  const wrap = document.getElementById('eligibility-content');
  if (!wrap) return;

  /* Wizard state — tracks answers across all steps */
  let state = { step: 1, citizen: null, age: null, voterList: null, convicted: null };

  /**
   * @description Renders the current step of the eligibility wizard
   * @returns {void}
   */
  function render() {
    const s = state.step;
    const total = 4;
    let html = '<div class="eligibility-card scale-in">';

    /* Progress indicator dots */
    html += '<div class="eligibility-progress">';
    for (let i = 1; i <= total; i++) {
      let cls = 'eligibility-progress-dot';
      if (i < s) cls += ' filled';
      else if (i === s) cls += ' current';
      html += '<div class="' + cls + '"></div>';
    }
    html += '</div>';

    if (s <= total) {
      html += '<div class="eligibility-step">';
      html += '<div class="eligibility-step-number">Step ' + s + ' of ' + total + '</div>';
    }

    /* Step 1: Citizenship check */
    if (s === 1) {
      html += '<h3>Are you an Indian citizen?</h3>';
      html += '<div class="eligibility-options">';
      html += '<button class="eligibility-option" data-elig-key="citizen" data-elig-val="true">Yes, I am</button>';
      html += '<button class="eligibility-option" data-elig-key="citizen" data-elig-val="false">No</button>';
      html += '</div>';

    /* Step 2: Age input with validation */
    } else if (s === 2) {
      html += '<h3>How old are you?</h3>';
      html += '<p class="text-secondary" style="font-size:.9rem;margin-bottom:12px">Enter your current age in years</p>';
      html += '<label for="elig-age" class="sr-only">Your age in years</label>';
      html += '<input type="number" class="eligibility-input" id="elig-age" min="1" max="150" placeholder="e.g. 19" aria-label="Enter your age">';
      html += '<div id="age-error" class="eligibility-error"></div>';
      html += '<button class="btn btn-primary eligibility-next" id="elig-submit-age">Continue</button>';

    /* Step 3: Voter list status */
    } else if (s === 3) {
      html += '<h3>Is your name on the voter list?</h3>';
      html += '<div class="eligibility-options">';
      html += '<button class="eligibility-option" data-elig-key="voterList" data-elig-val="yes">Yes</button>';
      html += '<button class="eligibility-option" data-elig-key="voterList" data-elig-val="no">No</button>';
      html += '<button class="eligibility-option" data-elig-key="voterList" data-elig-val="unsure">I don\'t know</button>';
      html += '</div>';

    /* Step 4: Conviction check */
    } else if (s === 4) {
      html += '<h3>Have you been convicted and sentenced to 2+ years imprisonment?</h3>';
      html += '<div class="eligibility-options">';
      html += '<button class="eligibility-option" data-elig-key="convicted" data-elig-val="true">Yes</button>';
      html += '<button class="eligibility-option" data-elig-key="convicted" data-elig-val="false">No</button>';
      html += '</div>';

    /* Results display */
    } else {
      html += showResult();
    }

    if (s <= total) html += '</div>';
    html += '</div>';
    wrap.innerHTML = html;

    /* Focus the age input field when step 2 is rendered */
    if (s === 2) {
      const inp = document.getElementById('elig-age');
      const submitBtn = document.getElementById('elig-submit-age');
      if (inp) {
        inp.focus();
        inp.addEventListener('keydown', handleAgeKeydown);
      }
      if (submitBtn) {
        submitBtn.addEventListener('click', submitAge);
      }
    }
    
    /* Attach event listeners for option buttons */
    const options = wrap.querySelectorAll('.eligibility-option');
    options.forEach(btn => {
      btn.addEventListener('click', function() {
        const key = this.getAttribute('data-elig-key');
        let val = this.getAttribute('data-elig-val');
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        eligAnswer(key, val);
      });
    });
    
    /* Attach reset button listener */
    const resetBtn = document.getElementById('elig-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetEligibility);
    }
  }

  /**
   * @description Handles Enter key press on the age input field
   * @param {KeyboardEvent} e - The keydown event
   * @returns {void}
   */
  function handleAgeKeydown(e) {
    if (e.key === 'Enter') submitAge();
  }

  /**
   * @description Generates the result card HTML based on the wizard answers
   * @returns {string} HTML string for the result card
   */
  function showResult() {
    trackEligibilityCompletion('checker_completed');
    let r = '';

    /* Non-citizen — not eligible */
    if (!state.citizen) {
      r += '<div class="result-card ineligible fade-in">';
      r += '<div class="result-icon">\u274C</div>';
      r += '<h3>Not Eligible</h3>';
      r += '<p>Only Indian citizens are eligible to vote in Indian elections. If you hold Indian citizenship, please try again.</p>';

    /* Convicted — currently ineligible */
    } else if (state.convicted) {
      r += '<div class="result-card ineligible fade-in">';
      r += '<div class="result-icon">\u274C</div>';
      r += '<h3>Currently Ineligible</h3>';
      r += '<p>Persons convicted with a sentence of 2+ years cannot vote while imprisoned and are disqualified from contesting for 6 years after release (Section 8, RPA 1951).</p>';

    /* Under 17 — too young */
    } else if (state.age < 17) {
      r += '<div class="result-card ineligible fade-in">';
      r += '<div class="result-icon">\u23F3</div>';
      r += '<h3>Not Yet Eligible</h3>';
      r += '<p>You must be at least 17 to apply in advance and 18 to vote. Keep learning about the process — you\'ll be ready when the time comes!</p>';

    /* Age 17 — can pre-register */
    } else if (state.age >= 17 && state.age < 18) {
      r += '<div class="result-card not-yet fade-in">';
      r += '<div class="result-icon">\uD83D\uDD52</div>';
      r += '<h3>Almost There! Pre-Register Now</h3>';
      r += '<p>Since 2023, 17-year-olds can apply in advance. Your registration activates when you turn 18. Apply using Form 6 at <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a>.</p>';

    /* Unsure about voter list — check status */
    } else if (state.voterList === 'unsure') {
      r += '<div class="result-card check-needed fade-in">';
      r += '<div class="result-icon">\uD83D\uDD0D</div>';
      r += '<h3>Check Your Voter Status</h3>';
      r += '<p>You appear eligible, but need to confirm your voter registration. Check at <a href="https://electoralsearch.eci.gov.in" target="_blank">electoralsearch.eci.gov.in</a> or call <strong>1950</strong>.</p>';

    /* Not on voter list — register now */
    } else if (state.voterList === 'no') {
      r += '<div class="result-card not-yet fade-in">';
      r += '<div class="result-icon">\uD83D\uDCDD</div>';
      r += '<h3>Eligible — Register Now!</h3>';
      r += '<p>You are eligible to vote but need to register. Apply using Form 6 at <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a> to get on the electoral roll.</p>';

    /* Fully eligible */
    } else {
      r += '<div class="result-card eligible fade-in">';
      r += '<div class="result-icon">\u2705</div>';
      r += '<h3>You Are Eligible to Vote!</h3>';
      r += '<p>You are a registered Indian voter. Make sure to carry a valid photo ID on polling day. Your vote matters — every vote counts!</p>';
    }

    r += '<button class="btn btn-secondary btn-sm elig-reset-btn" id="elig-reset" style="margin-top:8px">\u21BB Start Over</button>';
    r += '</div>';
    return r;
  }

  /**
   * @description Records a wizard answer and advances to the next step
   * @param {string} key - The state property to update
   * @param {*} val - The answer value
   * @returns {void}
   */
  function eligAnswer(key, val) {
    state[key] = val;

    /* Skip to results early for immediate disqualifications */
    if (key === 'citizen' && !val) { state.step = 5; }
    else if (key === 'convicted' && val) { state.step = 5; }
    else { state.step++; }

    render();
  }

  /**
   * @description Validates and submits the age input with comprehensive error handling
   * @returns {void}
   */
  function submitAge() {
    const inp = document.getElementById('elig-age');
    const errorDiv = document.getElementById('age-error');
    if (!inp) return;

    const rawValue = inp.value.trim();

    /* Validate empty input */
    if (!rawValue) {
      errorDiv.textContent = 'Please enter your age to continue';
      errorDiv.style.display = 'block';
      inp.style.borderColor = '#dc2626';
      return;
    }

    /* Validate non-numeric input */
    if (!/^\d+$/.test(rawValue)) {
      errorDiv.textContent = 'Please enter a valid age (numbers only)';
      errorDiv.style.display = 'block';
      inp.style.borderColor = '#dc2626';
      return;
    }

    const age = parseInt(rawValue, 10);

    /* Validate unreasonable age values */
    if (isNaN(age) || age < 1 || age > 150) {
      errorDiv.textContent = 'Please enter a valid age';
      errorDiv.style.display = 'block';
      inp.style.borderColor = '#dc2626';
      return;
    }

    state.age = age;

    /* Skip directly to results if too young */
    if (age < 17) { state.step = 5; }
    else { state.step = 3; }

    render();
  };

  /**
   * @description Resets the eligibility wizard to step 1
   * @returns {void}
   */
  function resetEligibility() {
    state = { step: 1, citizen: null, age: null, voterList: null, convicted: null };
    render();
  }

  /* Initial render */
  render();
}
