/**
 * @file glossary.js
 * @description Searchable election glossary and FAQ accordion with
 *              keyboard navigation, debounced search, and ARIA support.
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * @description Builds the searchable glossary section from ELECTION_DATA
 * @returns {void}
 */
function buildGlossary() {
  const wrap = document.getElementById('glossary-content');
  if (!wrap) return;

  const terms = ELECTION_DATA.glossaryTerms;

  /* Search input with accessibility label */
  let html = '<div class="search-input-wrap">';
  html += '<span class="search-icon">\uD83D\uDD0D</span>';
  html += '<label for="glossary-search" class="sr-only">Search election terms</label>';
  html += '<input type="text" class="search-input" id="glossary-search" placeholder="Search terms\u2026" autocomplete="off" aria-label="Search election terms">';
  html += '</div>';
  html += '<div class="accordion glossary-grid" id="glossary-list" role="region" aria-label="Election Glossary">';
  html += renderTerms(terms);
  html += '</div>';

  wrap.innerHTML = html;

  /* Attach debounced search handler to filter glossary terms */
  const searchInput = document.getElementById('glossary-search');
  searchInput.addEventListener('input', debounce(function () {
    trackGlossarySearch(searchInput.value.trim().length > 0);
    const q = searchInput.value.toLowerCase().trim();
    const filtered = terms.filter(function (t) {
      return t.term.toLowerCase().indexOf(q) !== -1 || t.definition.toLowerCase().indexOf(q) !== -1;
    });
    const list = document.getElementById('glossary-list');
    if (filtered.length === 0) {
      list.innerHTML = '<div class="no-results">No terms match your search.</div>';
    } else {
      list.innerHTML = renderTerms(filtered);
      attachGlossaryListeners(list);
    }
  }, 200));

  /* Initial attachment of listeners */
  attachGlossaryListeners(document.getElementById('glossary-list'));
}

/**
 * @description Attaches click and keydown listeners to glossary accordion headers
 * @param {HTMLElement} container - The container holding the accordion items
 * @returns {void}
 */
function attachGlossaryListeners(container) {
  if (!container) return;
  const headers = container.querySelectorAll('.accordion-header');
  for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function() {
      toggleAccordion(this);
    });
    headers[i].addEventListener('keydown', handleAccordionKeydown);
  }
}

/**
 * @description Generates accordion HTML for an array of glossary terms
 * @param {Array<Object>} terms - Array of term objects with term, definition, source
 * @returns {string} HTML string for all accordion items
 */
function renderTerms(terms) {
  let html = '';
  for (let i = 0; i < terms.length; i++) {
    const t = terms[i];
    html += '<div class="accordion-item">';
    html += '<div class="accordion-header" tabindex="0" role="button" aria-expanded="false">';
    html += '<h3>' + t.term + '</h3>';
    html += '<span class="accordion-chevron">\u25BC</span>';
    html += '</div>';
    html += '<div class="accordion-body">';
    html += '<div class="accordion-body-inner">';
    html += '<p>' + t.definition + '</p>';
    html += '<div class="accordion-source">Source: ' + t.source + '</div>';
    html += '</div></div></div>';
  }
  return html;
}

/**
 * @description Builds the FAQ accordion section from ELECTION_DATA
 * @returns {void}
 */
function buildFAQ() {
  const wrap = document.getElementById('faq-content');
  if (!wrap) return;

  const items = ELECTION_DATA.faqItems;

  let html = '<div class="accordion" role="region" aria-label="Frequently Asked Questions">';
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    html += '<div class="accordion-item animate-on-scroll">';
    html += '<div class="accordion-header" tabindex="0" role="button" aria-expanded="false">';
    html += '<h3>' + f.question + '</h3>';
    html += '<span class="accordion-chevron">\u25BC</span>';
    html += '</div>';
    html += '<div class="accordion-body">';
    html += '<div class="accordion-body-inner">';
    html += '<p>' + f.answer + '</p>';
    html += '</div></div></div>';
  }
  html += '</div>';
  wrap.innerHTML = html;

  /* Attach click and keyboard listeners to all FAQ accordion headers */
  const headers = wrap.querySelectorAll('.accordion-header');
  for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function() {
      toggleAccordion(this);
    });
    headers[i].addEventListener('keydown', handleAccordionKeydown);
  }
}

/**
 * @description Handles keyboard events on accordion headers (Enter/Space to toggle)
 * @param {KeyboardEvent} e - The keydown event
 * @returns {void}
 */
function handleAccordionKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleAccordion(e.currentTarget);
  }
}

/**
 * @description Toggles an accordion item open/closed and updates ARIA state
 * @param {HTMLElement} header - The clicked/activated accordion header
 * @returns {void}
 */
function toggleAccordion(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains('open');

  /* Close all sibling accordion items */
  const siblings = item.parentElement.querySelectorAll('.accordion-item');
  for (let i = 0; i < siblings.length; i++) {
    siblings[i].classList.remove('open');
    siblings[i].querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
  }

  /* Open the clicked item if it was previously closed */
  if (!isOpen) {
    item.classList.add('open');
    header.setAttribute('aria-expanded', 'true');
  }
}
