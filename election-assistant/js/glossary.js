/* glossary.js — Searchable glossary + FAQ accordion */

function buildGlossary() {
  var wrap = document.getElementById('glossary-content');
  if (!wrap) return;
  var terms = ELECTION_DATA.glossaryTerms;

  var html = '<div class="search-input-wrap">';
  html += '<span class="search-icon">\uD83D\uDD0D</span>';
  html += '<input type="text" class="search-input" id="glossary-search" placeholder="Search terms\u2026" autocomplete="off">';
  html += '</div>';
  html += '<div class="accordion glossary-grid" id="glossary-list">';
  html += renderTerms(terms);
  html += '</div>';

  wrap.innerHTML = html;

  document.getElementById('glossary-search').addEventListener('input', function() {
    var q = this.value.toLowerCase().trim();
    var filtered = terms.filter(function(t) {
      return t.term.toLowerCase().indexOf(q) !== -1 || t.definition.toLowerCase().indexOf(q) !== -1;
    });
    var list = document.getElementById('glossary-list');
    if (filtered.length === 0) {
      list.innerHTML = '<div class="no-results">No terms match your search.</div>';
    } else {
      list.innerHTML = renderTerms(filtered);
    }
  });
}

function renderTerms(terms) {
  var html = '';
  for (var i = 0; i < terms.length; i++) {
    var t = terms[i];
    html += '<div class="accordion-item">';
    html += '<div class="accordion-header" onclick="toggleAccordion(this)">';
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

function buildFAQ() {
  var wrap = document.getElementById('faq-content');
  if (!wrap) return;
  var items = ELECTION_DATA.faqItems;

  var html = '<div class="accordion">';
  for (var i = 0; i < items.length; i++) {
    var f = items[i];
    html += '<div class="accordion-item animate-on-scroll">';
    html += '<div class="accordion-header" onclick="toggleAccordion(this)">';
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
}

function toggleAccordion(header) {
  var item = header.parentElement;
  var body = item.querySelector('.accordion-body');
  var isOpen = item.classList.contains('open');

  // Close siblings
  var siblings = item.parentElement.querySelectorAll('.accordion-item');
  for (var i = 0; i < siblings.length; i++) {
    siblings[i].classList.remove('open');
    siblings[i].querySelector('.accordion-body').style.maxHeight = null;
  }

  if (!isOpen) {
    item.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}
