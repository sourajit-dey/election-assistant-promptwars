import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ELECTION_DATA: "readonly",
        GEMINI_API_KEY: "readonly",
        buildTimeline: "readonly",
        buildEligibilityChecker: "readonly",
        buildRegistrationTabs: "readonly",
        buildGlossary: "readonly",
        buildFAQ: "readonly",
        buildChatbot: "readonly",
        debounce: "readonly",
        scrollToSection: "readonly",
        formatIndianDate: "readonly",
        sanitizeInput: "readonly",
        toggleTimeline: "readonly",
        handleTimelineKeydown: "readonly",
        toggleAccordion: "readonly",
        handleAccordionKeydown: "readonly",
        runAllTests: "readonly",
        testDataIntegrity: "readonly",
        testEligibilityLogic: "readonly",
        testSanitization: "readonly",
        testDOMElements: "readonly"
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "prefer-const": "error",
      "no-var": "error"
    }
  }
];
