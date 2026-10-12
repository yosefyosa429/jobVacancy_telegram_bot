const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const fs = require("fs");
const { parse, isBefore, startOfDay } = require("date-fns");

// --- 1. የቅንብር መረጃዎች ---
const apiId = 32393969;
const apiHash = "15592dae313ca491e78fe85b731dff4f";
const SESSION_FILE = "session.txt";

let savedSession = "";
if (fs.existsSync(SESSION_FILE)) {
  savedSession = fs.readFileSync(SESSION_FILE, "utf8").trim();
}
const session = new StringSession(savedSession);

const SOURCE_CHANNELS = [
  "ethio_jobs",
  "freelance_ethiopia",
  "tikvah_ethiopia_jobs",
  "freelance_ethio",
  "opportunity_alerts",
  "hahujobs","vacancyforallethio","fanajobs","effoyjobs","ethreporterjobs","Kellylandopportunity","melat_nigussie_16","jobs_in_ethio","ethio_job_vacancy1"
];

const TARGET_CHANNEL = -1004374829615; 

// --- 2. የፍልተራ ቁልፍ ቃላት (Keywords) ---
const IT_KEYWORDS = [
  "it", "information technology", "software", "web", "developer", 
  "database", "system", "network", "graphics", "computer", "programmer",
  "frontend", "backend", "fullstack", "helpdesk", "technician"
];

const DIPLOMA_KEYWORDS = [
  "diploma", "ዲፕሎማ", "level 4", "level iv", "level 3", "10+3", "tvet"
];

// --- 3. የቀን ፍልተራ ሎጂክ (Date Checking Function) ---
function isDeadlineExpired(text) {
  if (!text) return false;

  // 1. የDeadline / የማመልከቻ ቀን ቁልፍ ቃላትን መፈለግ
  const deadlineRegex = /(?:deadline|ማመልከቻ ቀን|የመጨረሻ ቀን|በቅድሚያ|until|before)\s*[:፦]?\s*([a-zA-a-z0-9,\s/-]+)/i;
  const match = text.match(deadlineRegex);

  // ቀን ከተጽፎ ካልተገኘ (ቀን የለውም) -> አያልፈውም (Valid ነው)
  if (!match || !match[1]) {
    return false; 
  }

  const dateStr = match[1].trim();

  // 2. በፅሁፉ ውስጥ ያሉ ቀናትን ለመለየት (የተለያዩ ፎርማቶች)
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
        // የተገኘው ቀን ከዛሬ ቀን በፊት ከሆነ (ጊዜው አልፏል)
        if (!isNaN(parsedDate) && isBefore(parsedDate, today)) {
          return true; // Expired ሆኗል
        }
      } catch (e) {
        // Parsing ስህተት ካጋጠመው አያልፈውም
      }
    }
  }

  return false; // ጊዜው አላለፈም
}

// --- 4. የይዘት ፍልተራ ሎጂክ ---
function isMatchingJob(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();

  const hasIT = IT_KEYWORDS.some(kw => new RegExp(`\\b${kw}\\b`, "i").test(lowerText));
  const hasDiploma = DIPLOMA_KEYWORDS.some(kw => lowerText.includes(kw));

  // የIT እና የዲፕሎማ ስራ ሆኖ የመጨረሻ ቀኑ ያላለፈበት መሆን አለበት
  return hasIT && hasDiploma && !isDeadlineExpired(text);
}

// --- 5. የBot ዋና እስክሪፕት ---
(async () => {
  console.log("Userbot በማስነሳት ላይ...");
  
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("የስልክ ቁጥርህን አስገባ (+251...): "),
    password: async () => await input.text("የ2-Step Verification ፓስወርድህ (ካለህ): "),
    phoneCode: async () => await input.text("ወደ ቴሌግራም የተላከውን ኮድ አስገባ: "),
    onError: (err) => console.log(err),
  });

  const sessionString = client.session.save();
  fs.writeFileSync(SESSION_FILE, sessionString, "utf8");
  console.log(`✅ Session በ '${SESSION_FILE}' ላይ ተቀምጧል!`);

  // --- 6. ካለፉት 40 Postዎች ፈልጎ መላክ ---
  console.log("\n🔄 ከየቻናሎቹ ያለፉትን 40 መልእክቶች (ጊዜያቸው ያላለፈውን) በመፈተሽ ላይ...");
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

  // --- 7. አዳዲስ መልእክቶች ሲመጡ የሚከታተል Event Handler ---
  client.addEventHandler(async (event) => {
    const message = event.message;
    
    if (message && message.text) {
      if (isMatchingJob(message.text)) {
        try {
          console.log("አዲስ ተስማሚ የIT ዲፕሎማ ስራ ተገኝቷል! በመላክ ላይ...");
          await client.sendMessage(TARGET_CHANNEL, {
            message: `📌 **አዲስ የIT ዲፕሎማ ስራ ማስታወቂያ**\n\n${message.text}`,
          });
        } catch (error) {
          console.error("መልእክቱን መላክ አልተቻለም፦", error.message);
        }
      }
    }
  }, new NewMessage({ chats: SOURCE_CHANNELS }));
})();
