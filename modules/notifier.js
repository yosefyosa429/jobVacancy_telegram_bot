/**
 * Handles success and error notifications/logs for the bot
 */
const Notifier = {
  /**
   * Logs a successful job posting action
   * @param {string} channelName 
   */
  notifySuccess(channelName) {
    console.log(`[SUCCESS] Job from [${channelName}] successfully processed and sent to target channel!`);
  },

  /**
   * Logs an error message
   * @param {string} context 
   * @param {string} errorMessage 
   */
  notifyError(context, errorMessage) {
    console.error(`[ERROR] (${context}): ${errorMessage}`);
  },

  /**
   * Logs general info
   * @param {string} message 
   */
  notifyInfo(message) {
    console.log(`[INFO] ${message}`);
  }
};

module.exports = Notifier;
