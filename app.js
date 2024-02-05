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
const list = require("./words/wordsList.json");

app.get("/", async (req, res) => {
  // try {
  //   // Retrieve the user from the database
  //   const user = await Users.findOne({ email: "tornike.pirtakhia@gmail.com" });
  //   const l = list.filter((i) => i.type === "adjective" && i.level === "A1");
  //   if (user) {
  //     // Modify the stats as needed
  //     user.stats["Common Used Adjectives A1"] = l.map((it, x) => {
  //       return {
  //         ka: it.ka,
  //         en: it.en,
  //         total: 4,
  //       };
  //     });

  //     // Save the updated user back to the database
  //     user.markModified("stats");
  //     await user.save({ validateBeforeSave: false });

  //     // Respond to the request
  //     res.send(`
  //         <html>
  //           <head>
  //             <title>User Stats Updated</title>
  //           </head>
  //           <body>
  //             <h1>Wordes Updated</h1>
  //             <ul>
  //               <!-- User stats updated message -->
  //               <li>Stats have been updated.</li>
  //             </ul>
  //           </body>
  //         </html>
  //       `);
  //   } else {
  //     // User not found
  //     res.status(404).send("User not found");
  //   }
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Error processing request");
  // }
  res.send(`
          <html>
            <head>
              <title>User Stats Updated</title>
            </head>
            <body>
              <h1>Wordes Updated</h1>
              <ul>
                <!-- User stats updated message -->
                <li>Stats have been updated.</li>
              </ul>
            </body>
          </html>
        `);
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
  res.send("1.0.8");
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

// count daily usage in every night
cron.schedule("59 23 * * *", function () {
  const CountTotal = async () => {
    await updateDailyWordCounter();
  };
  CountTotal();
});

/**
 * Open ai API configs
 */

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

// ai bot
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

// ai text to speech

const path = require("path");
const { Storage } = require("@google-cloud/storage");

const serviceAccount = require("./service-account-file");
const storage = new Storage({
  credentials: serviceAccount,
});

const bucketName = "gs://wordes-ee906.appspot.com";

app.post("/ai/texttospeech", async (req, res) => {
  console.log(serviceAccount);
  const voice = req.query.voicesex === "man" ? "alloy" : "nova";
  const fileName = `${req.body.text}-${voice}.mp3`;
  const file = storage.bucket(bucketName).file(fileName);

  // Return the URL of the newly created file
  const options = {
    root: path.join(__dirname + "/words/voices/"),
  };
  const [exists] = await file.exists();
  if (exists) {
    // If file exists, generate a signed URL for downloading
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes from now
      version: "v4",
    });
    return res.json({ message: "File found in storage.", url });
  } else {
    const fileName = req.body.text + "-" + req.query.voicesex + ".mp3";

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: req.query.voicesex === "man" ? "alloy" : "nova",
        input: req.body.text,
      });
      // Generate a signed URL for the newly uploaded file
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Upload the buffer to GCS
      await file.save(buffer, {
        metadata: {
          contentType: "audio/mpeg",
        },
      });

      return res.json({ message: "File generated and uploaded.", url });
    } catch (error) {
      console.log("OpenAi API error: ", error);
    }
  }
});

// app.post("/ai/speechtotext", async (req, res) => {

// });

/**
 * error handler
 */

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
