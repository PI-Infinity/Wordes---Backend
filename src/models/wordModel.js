const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: { type: Object },
  pack: {
    type: Object,
  },
  infos: {
    type: Object,
  },
});

// define user model
const Word = mongoose.model("Word", wordSchema);

module.exports = Word;
