const { NewMessage } = require("telegram/events");
const { SOURCE_CHANNELS, TARGET_CHANNEL } = require("./config/constants");
const { isMatchingJob } = require("./modules/aiFilter");
const { isDuplicateJob, saveSentJob } = require("./modules/duplicateChecker");
const { formatJobText } = require("./modules/formatter");
const { getJobInlineButtons } = require("./modules/buttons");
const Notifier = require("./modules/notifier");
const { initTelegramClient } = require("./services/telegramService");

(async () => {
  try {
    Notifier.notifyInfo("Starting Telegram Userbot...");
    const client = await initTelegramClient();

    // 1. Scan historical messages from source channels
    Notifier.notifyInfo("Scanning historical messages from channels...");
    for (const channel of SOURCE_CHANNELS) {
      try {
        const messages = await client.getMessages(channel, { limit: 5 });
        for (const msg of messages.reverse()) {
          if (msg && msg.text) {
            // Check if job matches AI criteria
            const matchesAI = await isMatchingJob(msg.text);
            if (matchesAI) {
              // Check for duplicates
              if (isDuplicateJob(msg.text)) {
                console.log(`[Duplicate] Job from [${channel}] already sent. Skipping.`);
                continue;
              }

              Notifier.notifyInfo(`Suitable job found in [${channel}]! Formatting and sending...`);
              
              const formattedText = formatJobText(msg.text);
              const inlineButtons = getJobInlineButtons();

              await client.sendMessage(TARGET_CHANNEL, {
                message: formattedText,
                buttons: inlineButtons,
              });

              // Save to sent database to prevent future duplicates
              saveSentJob(msg.text);
              Notifier.notifySuccess(channel);

              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }
        }
      } catch (err) {
        Notifier.notifyError(`Channel history read error [${channel}]`, err.message);
      }
    }

    Notifier.notifyInfo("Historical scan completed! Now listening for new real-time messages...");

    // 2. Real-time event listener for new incoming messages
    client.addEventHandler(async (event) => {
      const message = event.message;

      if (message && message.text) {
        try {
          const matchesAI = await isMatchingJob(message.text);
          if (matchesAI) {
            // Check for duplicates
            if (isDuplicateJob(message.text)) {
              console.log("[Duplicate] Incoming job already sent. Skipping.");
              return;
            }

            Notifier.notifyInfo("New matching IT diploma job found in real-time! Sending...");
            
            const formattedText = formatJobText(message.text);
            const inlineButtons = getJobInlineButtons();

            await client.sendMessage(TARGET_CHANNEL, {
              message: formattedText,
              buttons: inlineButtons,
            });

            saveSentJob(message.text);
            Notifier.notifySuccess("Real-time Channel");
          }
        } catch (error) {
          Notifier.notifyError("Failed to send real-time message", error.message);
        }
      }
    }, new NewMessage({ chats: SOURCE_CHANNELS }));

  } catch (error) {
    console.error("Fatal Error encountered:", error);
  }
})();
