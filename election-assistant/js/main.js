/* main.js — App initialization and global interactions */

document.addEventListener('DOMContentLoaded', function() {
  // Build all sections
  buildTimeline();
  buildEligibilityChecker();
  buildRegistrationTabs();
  buildGlossary();
  buildFAQ();

  // Navbar active state via IntersectionObserver
  initNavObserver();

  // Smooth scroll for nav links
  initSmoothScroll();

  // Back-to-top button
  initBackToTop();

  // Animate-on-scroll
  initScrollAnimations();

  // Mobile hamburger
  initMobileMenu();

  // AI Chatbot
  buildChatbot();
});

/* --- Registration Tabs --- */
function buildRegistrationTabs() {
  var wrap = document.getElementById('register-content');
  if (!wrap) return;
  var data = ELECTION_DATA.registrationSteps;

  var tabs = [
    { key: 'newVoter', label: 'New Voter' },
    { key: 'overseasVoter', label: 'Overseas (NRI)' },
    { key: 'corrections', label: 'Corrections' }
  ];

  var html = '<div class="reg-tab-bar">';
  for (var i = 0; i < tabs.length; i++) {
    html += '<button class="reg-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + tabs[i].key + '">' + tabs[i].label + '</button>';
  }
  html += '</div>';

  for (var i = 0; i < tabs.length; i++) {
    var steps = data[tabs[i].key];
    html += '<div class="reg-panel' + (i === 0 ? ' active' : '') + '" data-panel="' + tabs[i].key + '">';
    for (var j = 0; j < steps.length; j++) {
      var st = steps[j];
      html += '<div class="reg-step animate-on-scroll">';
      html += '<div class="reg-step-num">' + st.stepNumber + '</div>';
      html += '<div class="reg-step-content">';
      html += '<h3>' + st.title + '</h3>';
      html += '<p>' + st.description + '</p>';
      html += '<div class="reg-step-tip"> ' + st.tip + '</div>';
      html += '</div></div>';
    }
    html += '</div>';
  }

  wrap.innerHTML = html;

  // Tab switching
  var tabBtns = wrap.querySelectorAll('.reg-tab');
  for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', function() {
      var key = this.getAttribute('data-tab');
      var allTabs = wrap.querySelectorAll('.reg-tab');
      var allPanels = wrap.querySelectorAll('.reg-panel');
      for (var t = 0; t < allTabs.length; t++) allTabs[t].classList.remove('active');
      for (var p = 0; p < allPanels.length; p++) allPanels[p].classList.remove('active');
      this.classList.add('active');
      wrap.querySelector('[data-panel="' + key + '"]').classList.add('active');
      // Re-trigger scroll animations for newly visible panel
      initScrollAnimations();
    });
  }
}

/* --- Navbar Active State --- */
function initNavObserver() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        for (var i = 0; i < navLinks.length; i++) {
          navLinks[i].classList.remove('active');
          if (navLinks[i].getAttribute('href') === '#' + id) {
            navLinks[i].classList.add('active');
          }
        }
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(function(sec) { observer.observe(sec); });
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  var links = document.querySelectorAll('a[href^="#"]');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu
        var navLinks = document.querySelector('.nav-links');
        var hamburger = document.querySelector('.hamburger');
        if (navLinks) navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
      }
    });
  }
}

/* --- Back to Top --- */
function initBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  var elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(function(el) { observer.observe(el); });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  var hamburger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}
