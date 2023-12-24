const User = require("../models/userModel");

const updateDailyWordCounter = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      if (!user.dailyWordCounter) {
        user.dailyWordCounter = {};
      }

      // Add the current day's count to the history
      const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const currentCount = user.dailyWordCounter.today || 0;

      if (!user.dailyWordCounter.history) {
        user.dailyWordCounter.history = [];
      }

      // Limit the history array to the last 23 entries
      if (user.dailyWordCounter.history.length >= 23) {
        user.dailyWordCounter.history.shift();
      }

      user.dailyWordCounter.history.push({
        date: currentDate,
        dailyTotal: currentCount,
      });

      // Reset the daily counter
      user.dailyWordCounter.today = 0;
      user.markModified("dailyWordCounter");

      await user.save({ validateBeforeSave: false });
    }
  } catch (error) {
    console.error("Error updating dailyWordCounter:", error);
  }
};
module.exports = { updateDailyWordCounter };
