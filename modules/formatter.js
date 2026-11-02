/**
 * Cleans up and formats the job description text for the target channel
 * @param {string} rawText - The original job text
 * @returns {string} - Formatted job text
 */
function formatJobText(rawText) {
  if (!rawText) return "";

  // 1. Remove unnecessary or spammy channel links (e.g., @channelname or t.me/...)
  let cleanedText = rawText
    .replace(/@\w+/g, "") // Remove mentions
    .replace(/https?:\/\/t\.me\/\S+/g, "") // Remove telegram links
    .trim();

  // 2. Build a clean, professional message layout with Markdown
  const formattedMessage = `📌 **አዲስ የኢቲ / ቴክኖሎጂ የስራ ማስታወቂያ**\n\n${cleanedText}\n\n━━━━━━━━━━━━━━━\n🤖 *Verified & Filtered by AI Job Bot*`;

  return formattedMessage;
}

module.exports = { formatJobText };
