/* eligibility.js — Multi-step eligibility checker */

function buildEligibilityChecker() {
  var wrap = document.getElementById('eligibility-content');
  if (!wrap) return;

  var state = { step: 1, citizen: null, age: null, voterList: null, convicted: null };

  function render() {
    var s = state.step;
    var total = 4;
    var html = '<div class="eligibility-card scale-in">';

    // Progress dots
    html += '<div class="eligibility-progress">';
    for (var i = 1; i <= total; i++) {
      var cls = 'eligibility-progress-dot';
      if (i < s) cls += ' filled';
      else if (i === s) cls += ' current';
      html += '<div class="' + cls + '"></div>';
    }
    html += '</div>';

    if (s <= total) {
      html += '<div class="eligibility-step">';
      html += '<div class="eligibility-step-number">Step ' + s + ' of ' + total + '</div>';
    }

    if (s === 1) {
      html += '<h3>Are you an Indian citizen?</h3>';
      html += '<div class="eligibility-options">';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'citizen\',true)">Yes, I am</button>';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'citizen\',false)">No</button>';
      html += '</div>';
    } else if (s === 2) {
      html += '<h3>How old are you?</h3>';
      html += '<p style="color:var(--text-secondary);font-size:.9rem;margin-bottom:12px">Enter your current age in years</p>';
      html += '<input type="number" class="eligibility-input" id="elig-age" min="1" max="120" placeholder="e.g. 19">';
      html += '<button class="btn btn-primary eligibility-next" onclick="submitAge()">Continue</button>';
    } else if (s === 3) {
      html += '<h3>Is your name on the voter list?</h3>';
      html += '<div class="eligibility-options">';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'voterList\',\'yes\')">Yes</button>';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'voterList\',\'no\')">No</button>';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'voterList\',\'unsure\')">I don\'t know</button>';
      html += '</div>';
    } else if (s === 4) {
      html += '<h3>Have you been convicted and sentenced to 2+ years imprisonment?</h3>';
      html += '<div class="eligibility-options">';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'convicted\',true)">Yes</button>';
      html += '<button class="eligibility-option" onclick="eligAnswer(\'convicted\',false)">No</button>';
      html += '</div>';
    } else {
      html += showResult();
    }

    if (s <= total) html += '</div>';
    html += '</div>';
    wrap.innerHTML = html;

    if (s === 2) {
      var inp = document.getElementById('elig-age');
      if (inp) {
        inp.focus();
        inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitAge(); });
      }
    }
  }

  function showResult() {
    var r = '';
    if (!state.citizen) {
      r += '<div class="result-card ineligible fade-in">';
      r += '<div class="result-icon">\u274C</div>';
      r += '<h3>Not Eligible</h3>';
      r += '<p>Only Indian citizens are eligible to vote in Indian elections. If you hold Indian citizenship, please try again.</p>';
    } else if (state.convicted) {
      r += '<div class="result-card ineligible fade-in">';
      r += '<div class="result-icon">\u274C</div>';
      r += '<h3>Currently Ineligible</h3>';
      r += '<p>Persons convicted with a sentence of 2+ years cannot vote while imprisoned and are disqualified from contesting for 6 years after release (Section 8, RPA 1951).</p>';
    } else if (state.age < 17) {
      r += '<div class="result-card ineligible fade-in">';
      r += '<div class="result-icon">\u23F3</div>';
      r += '<h3>Not Yet Eligible</h3>';
      r += '<p>You must be at least 17 to apply in advance and 18 to vote. Keep learning about the process — you\'ll be ready when the time comes!</p>';
    } else if (state.age >= 17 && state.age < 18) {
      r += '<div class="result-card not-yet fade-in">';
      r += '<div class="result-icon">\uD83D\uDD52</div>';
      r += '<h3>Almost There! Pre-Register Now</h3>';
      r += '<p>Since 2023, 17-year-olds can apply in advance. Your registration activates when you turn 18. Apply using Form 6 at <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a>.</p>';
    } else if (state.voterList === 'unsure') {
      r += '<div class="result-card check-needed fade-in">';
      r += '<div class="result-icon">\uD83D\uDD0D</div>';
      r += '<h3>Check Your Voter Status</h3>';
      r += '<p>You appear eligible, but need to confirm your voter registration. Check at <a href="https://electoralsearch.eci.gov.in" target="_blank">electoralsearch.eci.gov.in</a> or call <strong>1950</strong>.</p>';
    } else if (state.voterList === 'no') {
      r += '<div class="result-card not-yet fade-in">';
      r += '<div class="result-icon">\uD83D\uDCDD</div>';
      r += '<h3>Eligible — Register Now!</h3>';
      r += '<p>You are eligible to vote but need to register. Apply using Form 6 at <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a> to get on the electoral roll.</p>';
    } else {
      r += '<div class="result-card eligible fade-in">';
      r += '<div class="result-icon">\u2705</div>';
      r += '<h3>You Are Eligible to Vote!</h3>';
      r += '<p>You are a registered Indian voter. Make sure to carry a valid photo ID on polling day. Your vote matters — every vote counts!</p>';
    }
    r += '<button class="btn btn-secondary btn-sm" onclick="resetEligibility()" style="margin-top:8px">\u21BB Start Over</button>';
    r += '</div>';
    return r;
  }

  window.eligAnswer = function(key, val) {
    state[key] = val;
    if (key === 'citizen' && !val) { state.step = 5; }
    else if (key === 'convicted' && val) { state.step = 5; }
    else { state.step++; }
    render();
  };

  window.submitAge = function() {
    var inp = document.getElementById('elig-age');
    if (!inp) return;
    var age = parseInt(inp.value, 10);
    if (isNaN(age) || age < 1 || age > 120) { inp.style.borderColor = '#dc2626'; return; }
    state.age = age;
    if (age < 17) { state.step = 5; }
    else { state.step = 3; }
    render();
  };

  window.resetEligibility = function() {
    state = { step: 1, citizen: null, age: null, voterList: null, convicted: null };
    render();
  };

  render();
}
