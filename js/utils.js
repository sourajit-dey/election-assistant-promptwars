/**
 * @file utils.js
 * @description Shared utility functions used across the VoteGuide India app
 * @author VoteGuide India
 * @version 1.0.0
 */

/**
 * @description Creates a debounced version of a function that delays execution
 * @param {Function} func - The function to debounce
 * @param {number} delay - Milliseconds to wait before executing
 * @returns {Function} Debounced version of the input function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * @description Smoothly scrolls the viewport to an element by its ID
 * @param {string} elementId - The ID of the target element
 * @returns {void}
 */
function scrollToSection(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * @description Formats a Date object to Indian standard DD/MM/YYYY
 * @param {Date} date - The date object to format
 * @returns {string} Formatted date string in en-IN locale
 */
function formatIndianDate(date) {
  return date.toLocaleDateString('en-IN');
}

/**
 * @description Sanitizes user input to prevent XSS attacks
 * @param {string} input - Raw user input string
 * @returns {string} Sanitized string safe for display and processing
 */
function sanitizeInput(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}
