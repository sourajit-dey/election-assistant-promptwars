# VoteGuide India 🗳️

An interactive web application to help Indian citizens understand the complete Lok Sabha election process.

## Features

- **Interactive 7-Stage Election Timeline** — From announcement to counting, explore each stage with expandable details and fun facts
- **Voter Eligibility Checker** — Answer 4 quick questions to determine your voting eligibility
- **Step-by-Step Registration Guide** — Guides for new voters, overseas (NRI) voters, and corrections
- **Searchable Election Glossary** — 14 key terms every voter should know, with real-time search filtering
- **FAQ Section** — 8 common questions about Indian elections answered clearly
- **VoteGuide AI Chatbot** — AI-powered election assistant using Google Gemini 2.0 Flash
- **Fully Responsive** — Works perfectly on mobile, tablet, and desktop
- **Accessible** — WCAG AA compliant with ARIA labels, keyboard navigation, skip links, and screen reader support
- **Tested** — Automated test suite (append `?test=true` to URL to run)

## Google Services Used

| Service | Purpose | Implementation |
|---|---|---|
| Google Cloud App Engine | Production deployment and hosting | app.yaml + gcloud CLI |
| Google Gemini 2.0 Flash API | Powers the VoteGuide AI chatbot | js/chatbot.js |
| Google Analytics 4 | Anonymous feature engagement tracking | js/analytics.js |
| Google Charts | Election data visualization (seats + turnout) | js/charts.js |
| Google Maps Embed | Polling booth finder and ECI location | #booth-finder iframe |
| Google AI Studio | Gemini API key management | aistudio.google.com |
| Google Fonts (Inter, Poppins) | Premium typography via Google CDN | fonts.googleapis.com |
| Google Antigravity | Agentic development environment | antigravity.google |

## Deployment
Deployed on Google Cloud App Engine.
Live URL: [your-deployed-url-here]

Deploy command:
gcloud app deploy --project=YOUR_PROJECT_ID

## Built With

- HTML5, CSS3, Vanilla JavaScript
- Google Fonts (Inter, Poppins)
- Google Gemini 2.0 Flash API
- Built using Google Antigravity (agentic IDE)

## Content Sources

- [Election Commission of India](https://eci.gov.in) — eci.gov.in
- [National Voters Service Portal](https://voters.eci.gov.in) — voters.eci.gov.in
- Representation of the People Act, 1951
- Constitution of India (Articles 81, 324, 330)
- Supreme Court of India — PUCL v. Union of India (2013)

## File Structure

```
.
├── index.html            # Main HTML with semantic structure & CSP
├── README.md
├── .gitignore
├── package.json          # Node dependencies (ESLint, etc.)
├── eslint.config.js      # ESLint Flat Config for code quality
├── css/
│   ├── style.css         # Design tokens, layout, accessibility
│   ├── components.css    # Component styles (cards, timeline, chatbot)
│   └── animations.css    # Keyframes, scroll animations, will-change
├── js/
│   ├── config.js         # API key configuration (production)
│   ├── utils.js          # Shared utilities (debounce, sanitize, scroll)
│   ├── data.js           # Frozen election data (Object.freeze)
│   ├── timeline.js       # Timeline builder with ARIA & keyboard nav
│   ├── eligibility.js    # Multi-step eligibility checker with validation
│   ├── glossary.js       # Searchable glossary & FAQ with debounced search
│   ├── main.js           # App init, nav observer, scroll animations
│   ├── chatbot.js        # AI chatbot (Gemini API, rate limiting, XSS protection)
│   └── tests.js          # Automated test suite (?test=true)
└── assets/
    └── chakra.svg        # Ashoka Chakra icon
```

## Security Features

- Content Security Policy (CSP) meta tag restricts resource loading
- Input sanitization prevents XSS attacks in chatbot
- Rate limiting (2-second minimum) prevents API abuse
- Input length cap (500 characters) prevents oversized requests
- API key validation with graceful error handling

## Accessibility Features

- `<html lang="en-IN">` for correct language identification
- Skip navigation link for keyboard users
- Semantic HTML5 (`<main>`, `<nav>`, `<footer>`, `<article>`)
- ARIA labels on all interactive elements
- `aria-expanded` toggling on accordions and timeline
- `role="log" aria-live="polite"` on chat messages
- Keyboard navigation (Enter/Space) for timeline and accordions
- `:focus-visible` ring for keyboard focus indicators
- WCAG AA color contrast compliance
- `prefers-reduced-motion` support

## How to Run

Simply open `index.html` in any modern browser. No server or build step required.

To run the automated test suite, append `?test=true` to the URL and check the browser console.

## About

Built for Google PromptWars Virtual 2026 — Challenge 2.
