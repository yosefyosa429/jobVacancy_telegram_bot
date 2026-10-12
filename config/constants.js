require("dotenv").config(); // 👈 ይህ መስመር .env ፋይሉን ያነባል
const path = require("path");

module.exports = {
  API_ID: Number(process.env.API_ID), // Number ማድረግ አትርሳ ምክንያቱም .env ሁሉንም እንደ String ነው የሚያነበው
  API_HASH: process.env.API_HASH,
  SESSION_FILE: path.join(__dirname, "../session.txt"),

  SOURCE_CHANNELS: [
    "ethio_jobs",
    "freelance_ethiopia",
    "tikvah_ethiopia_jobs",
    "freelance_ethio",
    "opportunity_alerts",
    "hahujobs",
    "vacancyforallethio",
    "fanajobs",
    "effoyjobs",
    "ethreporterjobs",
    "Kellylandopportunity",
    "melat_nigussie_16",
    "jobs_in_ethio",
    "ethio_job_vacancy1",
  ],

  TARGET_CHANNEL: -1004374829615,

  IT_KEYWORDS: [
    "it", "information technology", "software", "web", "developer",
    "database", "system", "network", "graphics", "computer", "programmer",
    "frontend", "backend", "fullstack", "helpdesk", "technician"
  ],

  DIPLOMA_KEYWORDS: [
    "diploma", "ዲፕሎማ", "level 4", "level iv", "level 3", "10+3", "tvet"
  ]
};