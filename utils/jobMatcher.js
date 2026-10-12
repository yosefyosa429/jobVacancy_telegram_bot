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

  const hasIT = IT_KEYWORDS.some(kw => new RegExp(`\\b${kw}\\b`, "i").test(lowerText));
  const hasDiploma = DIPLOMA_KEYWORDS.some(kw => lowerText.includes(kw));

  return hasIT && hasDiploma && !isDeadlineExpired(text);
}

module.exports = { isMatchingJob };
