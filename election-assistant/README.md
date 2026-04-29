# VoteGuide India 🗳️

An interactive web application to help Indian citizens understand the complete Lok Sabha election process.

## Features

- **Interactive 7-Stage Election Timeline** — From announcement to counting, explore each stage with expandable details and fun facts
- **Voter Eligibility Checker** — Answer 4 quick questions to determine your voting eligibility
- **Step-by-Step Registration Guide** — Guides for new voters, overseas (NRI) voters, and corrections
- **Searchable Election Glossary** — 14 key terms every voter should know, with real-time search filtering
- **FAQ Section** — 8 common questions about Indian elections answered clearly
- **Fully Responsive** — Works perfectly on mobile, tablet, and desktop

## Built With

- HTML5, CSS3, Vanilla JavaScript
- Google Fonts (Inter, Poppins)
- Built using Google Antigravity (agentic IDE)

## Content Sources

- [Election Commission of India](https://eci.gov.in) — eci.gov.in
- [National Voters Service Portal](https://voters.eci.gov.in) — voters.eci.gov.in
- Representation of the People Act, 1951
- Constitution of India (Articles 81, 324, 330)
- Supreme Court of India — PUCL v. Union of India (2013)

## File Structure

```
election-assistant/
├── index.html
├── README.md
├── css/
│   ├── style.css          # Design system & base styles
│   ├── components.css     # Component styles (cards, timeline, etc.)
│   └── animations.css     # Keyframes & scroll animations
├── js/
│   ├── data.js            # All election content data
│   ├── timeline.js        # Timeline builder
│   ├── eligibility.js     # Eligibility checker logic
│   ├── glossary.js        # Glossary & FAQ builders
│   └── main.js            # App initialization & global interactions
└── assets/
    └── chakra.svg         # Ashoka Chakra icon
```

## How to Run

Simply open `index.html` in any modern browser. No server or build step required.

## About

Built for Google PromptWars Virtual 2026 — Challenge 2.
