const fs = require("fs");
const path = require("path");

// Path to store sent job signatures/hashes or texts
const DB_FILE = path.join(__dirname, "../config/sent_jobs.json");

/**
 * Loads previously sent jobs from the JSON file
 * @returns {string[]}
 */
function loadSentJobs() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading sent jobs database:", error.message);
  }
  return [];
}

/**
 * Saves a job text/signature to the sent jobs database
 * @param {string} jobText 
 */
function saveSentJob(jobText) {
  try {
    const sentJobs = loadSentJobs();
    // Use a simple normalization (first 100 characters) as a signature
    const signature = jobText.substring(0, 100).trim();
    
    if (!sentJobs.includes(signature)) {
      sentJobs.push(signature);
      // Keep only the last 500 jobs to prevent the file from growing too large
      if (sentJobs.length > 500) {
        sentJobs.shift();
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(sentJobs, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Error saving sent job:", error.message);
  }
}

/**
 * Checks if a job has already been sent
 * @param {string} jobText 
 * @returns {boolean}
 */
function isDuplicateJob(jobText) {
  if (!jobText) return true;
  const sentJobs = loadSentJobs();
  const signature = jobText.substring(0, 100).trim();

  return sentJobs.includes(signature);
}

module.exports = { isDuplicateJob, saveSentJob };
