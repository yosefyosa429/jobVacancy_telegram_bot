const { parse, isBefore, startOfDay } = require("date-fns");

/**
 * የስራ ማስታወቂያው ጊዜው ያለፈበት መሆኑን ያረጋግጣል
 * @param {string} text - የስራ ማስታወቂያ ጽሁፍ
 * @returns {boolean} - ያለፈበት ከሆነ true
 */
function isDeadlineExpired(text) {
  if (!text) return false;

  const deadlineRegex = /(?:deadline|deadline date|ማመልከቻ ቀን|የመጨረሻ ቀን|በቅድሚያ|until|before)\s*[:፦]?\s*([a-zA-a-z0-9,\s/-]+)/i;
  const match = text.match(deadlineRegex);

  if (!match || !match[1]) {
    return false; // የቀን መረጃ ከሌለው አያልፈውም
  }

  const dateStr = match[1].trim();

  const datePatterns = [
    { regex: /(\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b)/, fmt: "dd/MM/yyyy" },
    { regex: /(\b[A-Za-z]+\s+\d{1,2},\s*\d{4}\b)/, fmt: "MMMM d, yyyy" },
    { regex: /(\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b)/, fmt: "d MMMM yyyy" }
  ];

  const today = startOfDay(new Date());

  for (const pattern of datePatterns) {
    const foundDate = dateStr.match(pattern.regex);
    if (foundDate) {
      try {
        const parsedDate = parse(foundDate[0], pattern.fmt, new Date());
        if (!isNaN(parsedDate) && isBefore(parsedDate, today)) {
          return true; // Expired ሆኗል
        }
      } catch (e) {
        // Parsing error ካጋጠመ ያልፈዋል
      }
    }
  }

  return false;
}

module.exports = { isDeadlineExpired };
