const { IT_KEYWORDS, DIPLOMA_KEYWORDS } = require("../config/constants");
const { isDeadlineExpired } = require("./dateChecker");

/**
 * መልእክቱ ከምንፈልገው የስራ መስፈርት ጋር እንደሚስማማ ይፈትሻል
 * @param {string} text - የመልእክቱ ጽሁፍ
 * @returns {boolean}
 */
function isMatchingJob(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();

  // 1. IT ኪይዎርዶችን መፈተሽ (እንደ ሙሉ ቃል)
  const hasIT = IT_KEYWORDS.some(kw => new RegExp(`\\b${kw}\\b`, "i").test(lowerText));

  // 2. የዲፕሎማ/ትምህርት ዝግጅት መፈተሽ (እንደ regex በሰፊው)
  const hasDiploma = DIPLOMA_KEYWORDS.some(kw => new RegExp(`\\b${kw}\\b`, "i").test(lowerText));

  // 3. የቀን ገደብ ማብቃቱን ማረጋገጥ
  const deadlineExpired = isDeadlineExpired(text);

  // ለጊዜው ስህተቱን ለማየት ኮንሶል ላይ ማተም (Debugging)
  console.log(`[Filter Check] -> IT: ${hasIT}, Diploma: ${hasDiploma}, Expired: ${deadlineExpired}`);

  return hasIT && hasDiploma && !deadlineExpired;
}

module.exports = { isMatchingJob };
