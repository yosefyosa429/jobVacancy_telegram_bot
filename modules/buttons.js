const { Api } = require("telegram");

/**
 * Creates inline keyboard buttons for the job message
 * @returns {Api.ReplyInlineMarkup}
 */
function getJobInlineButtons() {
  return new Api.ReplyInlineMarkup({
    rows: [
      new Api.KeyboardButtonRow({
        buttons: [
          new Api.KeyboardButtonUrl({
            text: "📢 የቴሌግራም ቻናል መቀላቀል",
            url: "https://t.me/", // ሊፈልጉት የሚችሉት የቻናል ሊንክ
          }),
        ],
      }),
    ],
  });
}

module.exports = { getJobInlineButtons };
