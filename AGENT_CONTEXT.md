# AGENT CONTEXT — VoteGuide India
# READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE

## WHAT THIS PROJECT IS
VoteGuide India is an interactive web app for Google PromptWars
Virtual 2026 Challenge 2. It helps Indian citizens understand the
Lok Sabha election process. This is a competition submission
evaluated by an AI checker on 6 parameters.
This is the FINAL submission attempt. One chance. Make it count.
Deadline: May 3, 2026, 11:59 PM IST.

## CURRENT SCORES — ATTEMPT 2 RESULT
- Code Quality:             86.25% → target 93%+
- Security:                 98.75% → PROTECT, never drop
- Efficiency:               80%    → target 92%+ CRITICAL
- Testing:                  78.75% → target 90%+ CRITICAL
- Accessibility:            98.75% → PROTECT, never drop
- Google Services:          75%    → target 95%+ CRITICAL
- Problem Statement:        98%    → PROTECT
- Overall:                  90.28% → target 95%+
- Current Rank:             380 → target top 100

## WHAT THE AI CHECKER SPECIFICALLY SAID WAS MISSING
1. "Usage reflects broader adoption of Google services like
   Cloud Functions, BigQuery, or AI/ML APIs across workflows"
   → We need Cloud Functions and Firebase backends
2. "Testing strategy demonstrates good breadth, including
   workflows and automated validation"
   → We need async tests, backend tests, workflow tests
3. Performance and efficiency indicators need to be stronger
   → We need Service Worker + PWA + caching strategy

## CURRENT FILE STRUCTURE
PW-Election-Assistant/
├── index.html
├── README.md
├── .gitignore (has js/config.js — NEVER CHANGE THIS)
├── .gcloudignore
├── app.yaml
├── Dockerfile
├── nginx.conf
├── eslint.config.js
├── package.json
├── package-lock.json
├── AGENT_CONTEXT.md
├── css/
│   ├── style.css
│   ├── components.css
│   └── animations.css
├── js/
│   ├── config.js       (GITIGNORED — real Gemini API key)
│   ├── utils.js        (debounce, sanitizeInput, scrollToSection,
│                        formatIndianDate)
│   ├── analytics.js    (Google Analytics 4 tracking)
│   ├── charts.js       (Google Charts visualization)
│   ├── data.js         (Object.freeze(ELECTION_DATA))
│   ├── timeline.js
│   ├── eligibility.js
│   ├── glossary.js
│   ├── main.js
│   ├── chatbot.js      (Gemini 2.0 Flash, rate limiting, XSS)
│   └── tests.js        (10 test groups, ?test=true URL)
└── assets/
    └── chakra.svg

## GOOGLE SERVICES ALREADY IN PROJECT
1. Google Cloud App Engine — hosting (app.yaml)
2. Google Gemini 2.0 Flash API — AI chatbot (chatbot.js)
3. Google Analytics 4 — usage tracking (analytics.js)
4. Google Charts — data visualization (charts.js)
5. Google Maps Embed — polling booth finder (index.html)
6. Google Fonts — Inter + Poppins typography
7. Google AI Studio — API key management
8. Google Antigravity — built the project
9. Google Translate — multilingual support (index.html)

## WHAT NEEDS TO BE ADDED IN THIS SESSION
1. Service Worker (sw.js) — offline caching, PWA
2. Web App Manifest (manifest.json) — installable PWA
3. Cloud Functions backend (functions/) — API proxy, security
4. Firebase Realtime Database (firebase.js) — usage analytics
5. Expanded test suite — 15+ test groups
6. Performance improvements — lazy loading, preload, caching
7. Better JSDoc and code documentation

## SCRIPT LOADING ORDER IN INDEX.HTML — DO NOT CHANGE ORDER
1. js/config.js
2. js/utils.js
3. js/analytics.js
4. js/firebase.js  (NEW — add here)
5. js/charts.js
6. js/data.js
7. js/timeline.js
8. js/eligibility.js
9. js/glossary.js
10. js/main.js
11. js/chatbot.js
12. js/tests.js

## ABSOLUTE RULES — VIOLATING ANY OF THESE WILL FAIL THE SCORE
1. NEVER use inline onclick="..." in JS-generated HTML strings
   Always use addEventListener. This breaks CSP and Security score.

2. NEVER put white text (#fff) on saffron (#FF9933) background
   Always use color: #1A1A2E on saffron. WCAG AA contrast rule.

3. NEVER expose js/config.js to GitHub
   It must always be in .gitignore. Check before every commit.

4. NEVER weaken the CSP meta tag
   Only ADD new domains. Never add unsafe-inline or unsafe-eval.

5. NEVER remove Object.freeze(ELECTION_DATA) from data.js

6. NEVER remove aria-* attributes, role, tabindex, skip-link

7. NEVER use var — always const or let

8. NEVER leave console.log() outside tests.js

9. NEVER change the script loading order

10. NEVER commit node_modules — it must be in .gitignore

## DESIGN SYSTEM — NEVER CHANGE
--primary: #FF9933 (saffron)
--secondary: #138808 (green)
--navy: #000080
--bg: #F8F9FA
--surface: #FFFFFF
--text-primary: #1A1A2E
Text on saffron: ALWAYS #1A1A2E, NEVER white
Fonts: Poppins (headings) + Inter (body) — Google Fonts

## WHAT IS ALREADY WORKING — DO NOT REBUILD
- 7-stage interactive election timeline
- 4-step voter eligibility checker
- Tabbed voter registration guide
- Searchable glossary with 14 terms
- FAQ accordion with 8 questions
- AI chatbot using Gemini 2.0 Flash
- 10-group automated test suite
- Google Analytics event tracking
- Google Charts (seats + turnout)
- Google Maps embed (booth finder)
- Google Translate widget
- Deployed on Google Cloud App Engine