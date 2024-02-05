require("dotenv").config();
const express = require("express");
var axios = require("axios");
var morgan = require("morgan");

var cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.0.100:3000",
  "http://192.168.0.101:3000",
  "http://192.168.0.102:3000",
  "http://192.168.0.103:3000",
  "http://192.168.0.104:3000",
  "http://192.168.0.105:3000",
  "http://192.168.0.106:3000",
  "http://192.168.1.6:3000",
  "exp://192.168.0.104:19000",
  "exp://192.168.0.104:8081",
  "exp://192.168.0.100:19000",
  "exp://192.168.0.100:8081",
  "exp://192.168.0.103:19000",
  "exp://192.168.0.103:8081",
  "exp://192.168.0.102:19000",
  "exp://192.168.0.102:8081",
  "exp://192.168.0.101:19000",
  "exp://192.168.0.101:8081",
  "exp://172.20.10.8",
  "*",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Otherwise, block the request by sending an error to the callback
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());
app.use(morgan("dev"));

const AppError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controllers/errorController");
const userRoutes = require("./src/routes/userRoutes");

const { SendSimpleEmail } = require("./src/utils/emails");

app.get("/", async (req, res) => {
  try {
    res.send(`
        <html>
          <head>
            <title>User Names</title>
          </head>
          <body>
            <h1>Wordes</h1>
            <ul>
              <!-- User names can be listed here -->
            </ul>
          </body>
        </html>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});

const { correctUserWordsBase } = require("./functions/correctUserWordsList");
app.get("/corrector", async (req, res) => {
  try {
    correctUserWordsBase();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});

app.get("/version", (req, res) => {
  res.send("1.0.7");
});

// send email from user to support
app.post("/support/sendEmail", async (req, res) => {
  const options = req.body;
  try {
    await SendSimpleEmail(
      {
        email: options.email,
        message: options.message,
      },
      res
    ); // Passing the 'res' object here
  } catch (err) {
    // Handle any unexpected errors here if they're not handled in the SendSimpleEmail function
    res.status(500).json({ status: "fail", message: "Server error" });
  }
});

app.use("/api/v1", userRoutes);

/**
 * define device unique id
 */

const machineId = require("node-machine-id").machineIdSync();

app.get("/machineId", async (req, res) => {
  res.json(machineId);
});

/**
 * send notification to users evey day
 */
const cron = require("node-cron");
const { sendPushNotifications } = require("./src/utils/pushNotifications");
const { updateDailyWordCounter } = require("./src/utils/dailyTotalCounter");

const Users = require("./src/models/userModel");

cron.schedule("00 15 * * *", function () {
  const SendNotifs = async () => {
    const usersWithTokens = await Users.find({
      pushNotificationToken: { $exists: true, $ne: "" },
    });

    const tokens = usersWithTokens
      .map((user) => user.pushNotificationToken)
      .filter((token) => token.length > 0);

    sendPushNotifications(tokens);
  };
  SendNotifs();
});

cron.schedule("59 23 * * *", function () {
  const CountTotal = async () => {
    await updateDailyWordCounter();
  };
  CountTotal();
});

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});
app.post("/ai/assistent", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: req.body.text,
        },
      ],
      model: "gpt-3.5-turbo",
    }); // Passing the 'res' object here

    res.status(200).json({
      status: "success",
      data: {
        answer: completion,
      },
    });
  } catch (error) {
    console.error("Error:", error); // Logging the error to the console for debugging
    res.status(500).send(`Error processing the image: ${error.message}`);
  }
});

/**
 * error handler
 */

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
