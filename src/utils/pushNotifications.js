const { Expo } = require("expo-server-sdk");
const { initializeApp } = require("firebase-admin/app");

// Create a new Expo SDK client
let expo = new Expo();

const app = initializeApp();
const sendPushNotifications = async (tokens) => {
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

// var admin = require("firebase-admin");

// var serviceAccount = require("<FIREBASE_ADMIN_SDK_JSON>"); //https://firebase.google.com/docs/admin/setup

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const messaging = admin.messaging();

// // This registration token comes from the client FCM SDKs.
// const registrationToken = "<DEVICE_TOKEN>";

// const message = {
//   notification: {
//     title: "Test title",
//     body: "Test description",
//   },
//   token: registrationToken,
// };

// // Send a message to the device corresponding to the provided
// // registration token.
// admin
//   .messaging()
//   .send(message)
//   .then((response) => {
//     // Response is a message ID string.
//     console.log("Successfully sent message:", response);
//   })
//   .catch((error) => {
//     console.log("Error sending message:", error);
//   });
module.exports = { sendPushNotifications };
