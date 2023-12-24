const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  en: {
    type: String,
  },
  es: {
    type: String,
  },
  level: {
    type: String,
  },
  type: {
    type: String,
  },
  infos: {
    type: Object,
  },
});

// define user model
const Word = mongoose.model("Word", wordSchema);

module.exports = Word;
