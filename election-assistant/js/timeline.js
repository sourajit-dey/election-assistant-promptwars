/* timeline.js — Builds the interactive election timeline */

function buildTimeline() {
  var container = document.getElementById('timeline-content');
  if (!container) return;
  var stages = ELECTION_DATA.timelineStages;
  var html = '<div class="timeline">';

  for (var i = 0; i < stages.length; i++) {
    var s = stages[i];
    html += '<div class="timeline-item animate-on-scroll" data-stage="' + s.id + '">';
    html += '<div class="timeline-circle">' + s.stage + '</div>';
    html += '<div class="timeline-header" onclick="toggleTimeline(this)">';
    html += '<div class="timeline-header-left">';
    html += '<span class="timeline-icon">' + s.icon + '</span>';
    html += '<div class="timeline-header-text">';
    html += '<h3>' + s.title + '</h3>';
    html += '<p>' + s.subtitle + '</p>';
    html += '</div></div>';
    html += '<div class="timeline-meta">';
    html += '<span class="badge badge-saffron">' + s.duration + '</span>';
    html += '<span class="timeline-chevron">\u25BC</span>';
    html += '</div></div>';
    html += '<div class="timeline-content">';
    html += '<div class="timeline-content-inner">';
    html += '<ul>';
    for (var j = 0; j < s.details.length; j++) {
      html += '<li>' + s.details[j] + '</li>';
    }
    html += '</ul>';
    html += '<div class="timeline-funfact">';
    html += '<div class="timeline-funfact-label">\uD83D\uDCA1 Did you know?</div>';
    html += '<p>' + s.funFact + '</p>';
    html += '</div></div></div></div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function toggleTimeline(header) {
  var item = header.parentElement;
  var content = item.querySelector('.timeline-content');
  var isActive = item.classList.contains('active');

  // Close all
  var allItems = document.querySelectorAll('.timeline-item');
  for (var i = 0; i < allItems.length; i++) {
    allItems[i].classList.remove('active');
    allItems[i].querySelector('.timeline-content').style.maxHeight = null;
  }

  // Open clicked if it was closed
  if (!isActive) {
    item.classList.add('active');
    content.style.maxHeight = content.scrollHeight + 'px';
  }
}
