const { Expo } = require("expo-server-sdk");

// Create a new Expo SDK client
let expo = new Expo();

const sendPushNotifications = async (tokens) => {
  console.log(tokens);
  let messages = [];

  for (let pushToken of tokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title: "Wordes - Easy Learn",
      body: "Boost your language skills with just a few minutes on Wordes today! 📚✨",
      data: { withSome: "data" },
    });
  }
  console.log("here came");
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
};
module.exports = { sendPushNotifications };
