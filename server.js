require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app = require("./app");

mongoose.set("bufferCommands", false);

const DB = process.env.MONGODB.replace(
  "<PASSWORD>",
  process.env.MONGODB_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("Db connection successful");
  })
  .catch((err) => console.log("ERROR"));

/**
 * create socket server
 */
const http = require("http");
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// const PORT = 5000;
// server.listen(PORT, "172.20.10.8", () =>
//   console.log(`Server started on port ${PORT}`)
// );
