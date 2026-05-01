/**
 * @file charts.js
 * @description Google Charts integration for VoteGuide India.
 *              Visualizes 2024 Lok Sabha seat distribution and 
 *              phase-wise voter turnout using Google Charts library.
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * @description Initializes Google Charts and triggers drawing
 *              when the library is ready. Safe if Google Charts 
 *              is not loaded — fails silently.
 * @returns {void}
 */
function initGoogleCharts() {
  if (typeof google === 'undefined' ||
      typeof google.charts === 'undefined') {
    return;
  }
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(drawAllCharts);
}

/**
 * @description Master chart renderer — draws all chart instances
 * @returns {void}
 */
function drawAllCharts() {
  drawSeatDistributionChart();
  drawVoterTurnoutChart();
}

/**
 * @description Draws donut chart of 2024 Lok Sabha seat distribution
 * @returns {void}
 */
function drawSeatDistributionChart() {
  const container = document.getElementById('chart-seats');
  if (!container) return;
  const data = google.visualization.arrayToDataTable([
    ['Alliance', 'Seats Won'],
    ['NDA (BJP + allies)', 293],
    ['INDIA Alliance', 234],
    ['Others', 16]
  ]);
  const options = {
    title: '2024 Lok Sabha — 543 Total Seats',
    titleTextStyle: {
      fontName: 'Poppins', fontSize: 14, color: '#1A1A2E'
    },
    pieHole: 0.4,
    colors: ['#FF9933', '#138808', '#000080'],
    backgroundColor: 'transparent',
    legend: {
      position: 'bottom',
      textStyle: { fontName: 'Inter', fontSize: 12 }
    },
    chartArea: { width: '90%', height: '72%' }
  };
  const chart = new google.visualization.PieChart(container);
  chart.draw(data, options);
}

/**
 * @description Draws column chart of voter turnout by phase
 * @returns {void}
 */
function drawVoterTurnoutChart() {
  const container = document.getElementById('chart-turnout');
  if (!container) return;
  const data = google.visualization.arrayToDataTable([
    ['Phase', 'Turnout %'],
    ['Phase 1', 66.14],
    ['Phase 2', 66.71],
    ['Phase 3', 65.68],
    ['Phase 4', 69.16],
    ['Phase 5', 62.20],
    ['Phase 6', 63.36],
    ['Phase 7', 62.00]
  ]);
  const options = {
    title: '2024 Election — Voter Turnout by Phase',
    titleTextStyle: {
      fontName: 'Poppins', fontSize: 14, color: '#1A1A2E'
    },
    colors: ['#FF9933'],
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    hAxis: {
      title: 'Phase',
      titleTextStyle: { fontName: 'Inter', color: '#6B7280' }
    },
    vAxis: {
      title: 'Turnout %',
      minValue: 55,
      maxValue: 75,
      titleTextStyle: { fontName: 'Inter', color: '#6B7280' }
    },
    chartArea: { width: '78%', height: '68%' },
    bar: { groupWidth: '60%' }
  };
  const chart = new google.visualization.ColumnChart(container);
  chart.draw(data, options);
}
