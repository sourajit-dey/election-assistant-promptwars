/**
 * @file main.js
 * @description App initialization, global interactions, registration tabs,
 *              navigation observer, smooth scroll, back-to-top, scroll
 *              animations, and mobile menu. Uses a single IntersectionObserver.
 * @author VoteGuide India
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function () {
  /* Build all dynamic sections */
  buildTimeline();
  buildEligibilityChecker();
  buildRegistrationTabs();
  buildGlossary();
  buildFAQ();

  /* Initialize global UI behaviors */
  initNavObserver();
  initSmoothScroll();
  initBackToTop();
  initScrollAnimations();
  initMobileMenu();

  /* Initialize AI Chatbot */
  buildChatbot();
});

/* =========================================
   Registration Tabs
   ========================================= */

/**
 * @description Builds the tabbed registration guide (New Voter, NRI, Corrections)
 * @returns {void}
 */
function buildRegistrationTabs() {
  const wrap = document.getElementById('register-content');
  if (!wrap) return;

  const data = ELECTION_DATA.registrationSteps;
  const tabs = [
    { key: 'newVoter', label: 'New Voter' },
    { key: 'overseasVoter', label: 'Overseas (NRI)' },
    { key: 'corrections', label: 'Corrections' }
  ];

  /* Build tab bar */
  let html = '<div class="reg-tab-bar">';
  for (let i = 0; i < tabs.length; i++) {
    html += '<button class="reg-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + tabs[i].key + '">' + tabs[i].label + '</button>';
  }
  html += '</div>';

  /* Build tab panels with step cards */
  for (let i = 0; i < tabs.length; i++) {
    const steps = data[tabs[i].key];
    html += '<div class="reg-panel' + (i === 0 ? ' active' : '') + '" data-panel="' + tabs[i].key + '">';
    for (let j = 0; j < steps.length; j++) {
      const st = steps[j];
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

  /* Attach click handlers for tab switching */
  const tabBtns = wrap.querySelectorAll('.reg-tab');
  for (let i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', handleTabClick);
  }

  /**
   * @description Handles tab button click — switches active panel
   * @param {MouseEvent} e - The click event
   * @returns {void}
   */
  function handleTabClick() {
    const key = this.getAttribute('data-tab');
    const allTabs = wrap.querySelectorAll('.reg-tab');
    const allPanels = wrap.querySelectorAll('.reg-panel');

    /* Deactivate all tabs and panels */
    for (let t = 0; t < allTabs.length; t++) allTabs[t].classList.remove('active');
    for (let p = 0; p < allPanels.length; p++) allPanels[p].classList.remove('active');

    /* Activate selected tab and matching panel */
    this.classList.add('active');
    wrap.querySelector('[data-panel="' + key + '"]').classList.add('active');

    /* Re-trigger scroll animations for newly visible panel */
    initScrollAnimations();
  }
}

/* =========================================
   Navbar Active State Observer
   ========================================= */

/**
 * @description Highlights the active nav link based on which section is in view
 * @returns {void}
 */
function initNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  /**
   * @description Callback for nav section observer — highlights matching nav link
   * @param {Array<IntersectionObserverEntry>} entries - Observed entries
   * @returns {void}
   */
  function handleNavIntersection(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        for (let i = 0; i < navLinks.length; i++) {
          navLinks[i].classList.remove('active');
          if (navLinks[i].getAttribute('href') === '#' + id) {
            navLinks[i].classList.add('active');
          }
        }
      }
    });
  }

  const observer = new IntersectionObserver(handleNavIntersection, {
    rootMargin: '-30% 0px -60% 0px'
  });

  sections.forEach(function (sec) { observer.observe(sec); });
}

/* =========================================
   Smooth Scroll Navigation
   ========================================= */

/**
 * @description Enables smooth scrolling for all anchor links and closes mobile menu
 * @returns {void}
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  /**
   * @description Handles anchor link click — smooth scrolls and closes mobile menu
   * @param {MouseEvent} e - The click event
   * @returns {void}
   */
  function handleAnchorClick(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      /* Close mobile menu if open */
      const navLinksEl = document.querySelector('.nav-links');
      const hamburger = document.querySelector('.hamburger');
      if (navLinksEl) navLinksEl.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
    }
  }

  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', handleAnchorClick);
  }
}

/* =========================================
   Back to Top Button
   ========================================= */

/**
 * @description Initializes the back-to-top button visibility and click behavior
 * @returns {void}
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  /**
   * @description Shows/hides the back-to-top button based on scroll position
   * @returns {void}
   */
  function handleScrollVisibility() {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  /**
   * @description Scrolls the page to the top smoothly
   * @returns {void}
   */
  function handleBackToTopClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('scroll', handleScrollVisibility);
  btn.addEventListener('click', handleBackToTopClick);
}

/* =========================================
   Scroll Animations (Single Observer)
   ========================================= */

/** Single shared IntersectionObserver instance for all scroll animations */
let scrollAnimationObserver = null;

/**
 * @description Observes all .animate-on-scroll elements with a single IntersectionObserver
 * @returns {void}
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  /* Create observer only once — reuse across calls */
  if (!scrollAnimationObserver) {
    scrollAnimationObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
  }

  /* Observe all elements (safe to call multiple times) */
  elements.forEach(function (el) { scrollAnimationObserver.observe(el); });
}

/* =========================================
   Mobile Hamburger Menu
   ========================================= */

/**
 * @description Initializes the mobile hamburger menu toggle
 * @returns {void}
 */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  /**
   * @description Toggles the mobile menu open/closed
   * @returns {void}
   */
  function handleHamburgerClick() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  }

  hamburger.addEventListener('click', handleHamburgerClick);
}
