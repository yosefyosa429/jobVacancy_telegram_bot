const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const { API_ID, API_HASH, SESSION_FILE } = require("../config/constants");

async function initTelegramClient() {
  let savedSession = "";
  if (fs.existsSync(SESSION_FILE)) {
    savedSession = fs.readFileSync(SESSION_FILE, "utf8").trim();
  }
  const session = new StringSession(savedSession);

  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("የስልክ ቁጥርህን አስገባ (+251...): "),
    password: async () => await input.text("የ2-Step Verification ፓስወርድህ (ካለህ): "),
    phoneCode: async () => await input.text("ወደ ቴሌግራም የተላከውን ኮድ አስገባ: "),
    onError: (err) => console.error("Auth Error:", err),
  });

  const sessionString = client.session.save();
  fs.writeFileSync(SESSION_FILE, sessionString, "utf8");
  console.log(`✅ Session በ '${SESSION_FILE}' ላይ ተቀምጧል!`);

  return client;
}

module.exports = { initTelegramClient };
