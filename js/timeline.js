/**
 * @file timeline.js
 * @description Builds the interactive 7-stage election timeline with
 *              expandable cards, keyboard navigation, and ARIA support.
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * @description Builds the timeline HTML from ELECTION_DATA and injects it into the DOM
 * @returns {void}
 */
function buildTimeline() {
  const container = document.getElementById('timeline-content');
  if (!container) return;

  const stages = ELECTION_DATA.timelineStages;
  let html = '<div class="timeline" role="list">';

  /* Generate HTML for each timeline stage */
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    html += '<div class="timeline-item animate-on-scroll" data-stage="' + s.id + '" role="listitem">';
    html += '<div class="timeline-circle">' + s.stage + '</div>';

    /* Clickable header with ARIA attributes for accessibility */
    html += '<div class="timeline-header" tabindex="0" role="button"';
    html += ' aria-expanded="false"';
    html += ' aria-label="Expand Stage ' + s.stage + ': ' + s.title + ' details">';
    html += '<div class="timeline-header-left">';
    html += '<span class="timeline-icon">' + s.icon + '</span>';
    html += '<div class="timeline-header-text">';
    html += '<h3>' + s.title + '</h3>';
    html += '<p>' + s.subtitle + '</p>';
    html += '</div></div>';

    /* Duration badge and chevron indicator */
    html += '<div class="timeline-meta">';
    html += '<span class="badge badge-saffron">' + s.duration + '</span>';
    html += '<span class="timeline-chevron">\u25BC</span>';
    html += '</div></div>';

    /* Expandable content with details and fun fact */
    html += '<div class="timeline-content"><article class="timeline-content-inner"><ul>';
    for (let j = 0; j < s.details.length; j++) {
      html += '<li>' + s.details[j] + '</li>';
    }
    html += '</ul>';
    html += '<div class="timeline-funfact">';
    html += '<div class="timeline-funfact-label">\uD83D\uDCA1 Did you know?</div>';
    html += '<p>' + s.funFact + '</p>';
    html += '</div></article></div></div>';
  }

  html += '</div>';
  container.innerHTML = html;

  /* Attach click and keyboard event listeners to all timeline headers */
  const headers = container.querySelectorAll('.timeline-header');
  for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function() {
      toggleTimeline(this);
    });
    headers[i].addEventListener('keydown', handleTimelineKeydown);
  }
}

/**
 * @description Handles keyboard events on timeline headers (Enter/Space to toggle)
 * @param {KeyboardEvent} e - The keydown event
 * @returns {void}
 */
function handleTimelineKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleTimeline(e.currentTarget);
  }
}

/**
 * @description Toggles a timeline stage open/closed and updates ARIA state
 * @param {HTMLElement} header - The clicked/activated timeline header element
 * @returns {void}
 */
function toggleTimeline(header) {
  const item = header.parentElement;
  const content = item.querySelector('.timeline-content');
  const isActive = item.classList.contains('active');

  /* Close all open timeline items first */
  const allItems = document.querySelectorAll('.timeline-item');
  for (let i = 0; i < allItems.length; i++) {
    allItems[i].classList.remove('active');
    allItems[i].querySelector('.timeline-header').setAttribute('aria-expanded', 'false');
  }

  /* Open the clicked item if it was previously closed */
  if (!isActive) {
    item.classList.add('active');
    const titleEl = item.querySelector('h3');
    if (titleEl) { trackTimelineStageView(titleEl.textContent.trim(), 
      parseInt(item.getAttribute('data-stage') || '0', 10)); }
    header.setAttribute('aria-expanded', 'true');
  }
}
