const { NewMessage } = require("telegram/events");
const { SOURCE_CHANNELS, TARGET_CHANNEL } = require("./config/constants");
const { isMatchingJob } = require("./utils/jobMatcher");
const { initTelegramClient } = require("./services/telegramService");

(async () => {
  try {
    console.log("Userbot በማስነሳት ላይ...");
    const client = await initTelegramClient();

    // 1. የቆዩ (Historical) መልእክቶችን ፍተሻ
    console.log("\n🔄 ከየቻናሎቹ ያለፉትን መልእክቶች በመፈተሽ ላይ...");
    for (const channel of SOURCE_CHANNELS) {
      try {
        const messages = await client.getMessages(channel, { limit: 340 });
        for (const msg of messages.reverse()) {
          if (msg && msg.text && isMatchingJob(msg.text)) {
            console.log(`[${channel}] ተስማሚና ጊዜው ያላለፈ ስራ ተገኝቷል! በመላክ ላይ...`);
            await client.sendMessage(TARGET_CHANNEL, {
              message: `📌 **አዲስ የIT ዲፕሎማ ስራ ማስታወቂያ**\n\n${msg.text}`,
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      } catch (err) {
        console.error(`[${channel}] ታሪክ ሲነበብ ስህተት ተፈጠረ፦`, err.message);
      }
    }

    console.log("\n🚀 የቆዩ ታሪኮች ፍተሻ አልቋል! አሁን አዳዲስ መልእክቶችን በመከታተል ላይ ይገኛል...");

    // 2. አዳዲስ መልእክቶች ሲመጡ የሚከታተል Event Listener
    client.addEventHandler(async (event) => {
      const message = event.message;

      if (message && message.text && isMatchingJob(message.text)) {
        try {
          console.log("አዲስ ተስማሚ የIT ዲፕሎማ ስራ ተገኝቷል! በመላክ ላይ...");
          await client.sendMessage(TARGET_CHANNEL, {
            message: `📌 **አዲስ የIT ዲፕሎማ ስራ ማስታወቂያ**\n\n${message.text}`,
          });
        } catch (error) {
          console.error("መልእክቱን መላክ አልተቻለም፦", error.message);
        }
      }
    }, new NewMessage({ chats: SOURCE_CHANNELS }));

  } catch (error) {
    console.error("Fatal Error ተከሰተ፦", error);
  }
})();

