const { GoogleGenAI } = require("@google/genai");

// Load multiple API keys from .env separated by comma
const apiKeys = process.env.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY.split(",").map(key => key.trim()) 
  : [];

let currentKeyIndex = 0;

/**
 * Gets the next Gemini API client using Round Robin rotation
 * @returns {GoogleGenAI}
 */
function getNextAIClient() {
  if (apiKeys.length === 0) {
    throw new Error("No GEMINI_API_KEY provided in .env file.");
  }
  const apiKey = apiKeys[currentKeyIndex];
  // Rotate to the next key for the subsequent request
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return new GoogleGenAI({ apiKey });
}

/**
 * Analyzes job text using AI with precise criteria for IT, Web Dev, MERN, and Diploma levels
 * @param {string} jobText - The text of the job vacancy
 * @returns {Promise<boolean>}
 */
async function checkJobWithAI(jobText) {
  try {
    const ai = getNextAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `
        You are an expert job filtering assistant for an IT professional.
        Please carefully read the following job description text and determine if it matches the criteria below.

        CRITERIA FOR APPROVAL (Must match at least one role/qualification):
        1. Fields: Web Development, MERN Stack, Software Development, General IT, or IT Office/Technical Support roles.
        2. Educational Qualification: Suitable for Diploma holders (including Level 3, Level 4, TVET, 10+3, or general Diploma in IT/Computer Science). Degree-only or non-IT jobs must be REJECTED.

        Your response must be strictly "YES" or "NO". Do not write any other explanation or text.

        Job description text:
        ---
        ${jobText}
        ---
      `,
    });

    const resultText = response.text ? response.text.trim().toUpperCase() : "";
    return resultText.includes("YES");
  } catch (error) {
    console.error("AI filtering error encountered (Quota or Network):", error.message);
    return false; // Skip job if an error occurs
  }
}

module.exports = { checkJobWithAI };

