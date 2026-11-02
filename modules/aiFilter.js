const { checkJobWithAI } = require("../services/aiService");
const { isDeadlineExpired } = require("../utils/dateChecker");

/**
 * Validates if a job description matches IT diploma criteria and is not expired
 * @param {string} text - The job vacancy text
 * @returns {Promise<boolean>}
 */
async function isMatchingJob(text) {
  if (!text) return false;

  // 1. Check if the deadline has already expired
  const deadlineExpired = isDeadlineExpired(text);
  if (deadlineExpired) {
    console.log("[Filter Check] -> Expired: true (Skipped)");
    return false;
  }

  // 2. Check the job using Gemini AI service
  const isAiApproved = await checkJobWithAI(text);
  console.log(`[Filter Check] -> AI Approved: ${isAiApproved}`);

  return isAiApproved;
}

module.exports = { isMatchingJob };
