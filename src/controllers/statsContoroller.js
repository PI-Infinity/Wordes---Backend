const User = require("../models/userModel");
const Word = require("../models/wordModel");
const catchAsync = require("../utils/catchAsync");

exports.addWordStat = async (req, res, next) => {
  const userId = req.params.id;
  let inputData = req.body;

  // Function to update user stats
  function updateStats(stats, data) {
    const { word, pack, answer } = data;

    // Initialize the pack as an array if it doesn't exist
    if (!stats[pack.value]) {
      stats[pack.value] = [];
    }

    let packArray = stats[pack.value];
    let activeWordIndex = packArray.findIndex(
      (i) => i.en === word.en && i.ka === word.ka
    );

    if (answer === "true") {
      if (activeWordIndex > -1) {
        // Increment the total for the existing word
        packArray[activeWordIndex].total += 1;
      } else {
        // Add the new word with a total of 1
        packArray.push({ ...word, total: 1 });
      }
    } else {
      if (activeWordIndex > -1) {
        if (packArray[activeWordIndex].total > 1) {
          // Decrement the total
          packArray[activeWordIndex].total -= 1;
        } else {
          // Remove the word if total would become 0
          packArray.splice(activeWordIndex, 1);
        }
      }
      // If the word doesn't exist and the answer is false, do nothing
    }
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    updateStats(user.stats, inputData);

    // Mark the 'stats' path as modified
    user.markModified("stats");

    // Save the user document
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "User stats updated successfully",
      updatedStats: user.stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating user data",
    });
  }
};

exports.getPercents = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    const getTotalCorrectAnswersByPack = (stats) => {
      return Object.entries(stats).reduce((result, [packName, words]) => {
        result[packName] = words.reduce((sum, word) => sum + word.total, 0);
        return result;
      }, {});
    };

    const unlockNextPack = (currentPack, totalRequired, nextPack) => {
      if (statistics[currentPack] === totalRequired) {
        if (!user.packs.includes(nextPack)) {
          user.packs.push(nextPack);
        }
      }
    };

    const statistics = getTotalCorrectAnswersByPack(user.stats);

    // Unlock packs
    const packThresholds = {
      "Common Used Nouns A1": {
        total: 396 * 5,
        nextPack: "Common Used Nouns A2",
      },
      "Common Used Nouns A2": {
        total: 412 * 5,
        nextPack: "Common Used Nouns B1",
      },
      "Common Used Nouns B1": {
        total: 347 * 5,
        nextPack: "Common Used Nouns B2",
      },
      "Common Used Nouns B2": {
        total: 721 * 5,
        nextPack: "Common Used Nouns C1",
      },
      "Common Used Verbs A1": {
        total: 150 * 5,
        nextPack: "Common Used Verbs A2",
      },
      "Common Used Verbs A2": {
        total: 157 * 5,
        nextPack: "Common Used Verbs B1",
      },
      "Common Used Verbs B1": {
        total: 173 * 5,
        nextPack: "Common Used Verbs B2",
      },
      "Common Used Verbs B2": {
        total: 340 * 5,
        nextPack: "Common Used Verbs C1",
      },
      "Common Used Adjectives A1": {
        total: 123 * 5,
        nextPack: "Common Used Adjectives A2",
      },
      "Common Used Adjectives A2": {
        total: 140 * 5,
        nextPack: "Common Used Adjectives B1",
      },
      "Common Used Adjectives B1": {
        total: 154 * 5,
        nextPack: "Common Used Adjectives B2",
      },
      "Common Used Adjectives B2": {
        total: 281 * 5,
        nextPack: "Common Used Adjectives C1",
      },
      "Common Used Adverbs A1": {
        total: 91 * 5,
        nextPack: "Common Used Adverbs A2",
      },
      "Common Used Adverbs A2": {
        total: 55 * 5,
        nextPack: "Common Used Adverbs B1",
      },
      "Common Used Adverbs B1": {
        total: 60 * 5,
        nextPack: "Common Used Adverbs B2",
      },
      "Common Used Adverbs B2": {
        total: 88 * 5,
        nextPack: "Common Used Adverbs C1",
      },
    };

    Object.entries(packThresholds).forEach(
      ([packName, { total, nextPack }]) => {
        unlockNextPack(packName, total, nextPack);
      }
    );

    // Save the user document
    await user.save({ validateBeforeSave: false });
    console.log(statistics);
    res.status(200).json({
      status: "success",
      data: statistics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};

exports.pressCounter = async (req, res, next) => {
  const userId = req.params.id;
  const machineId = req.query.machineId;

  try {
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ name: machineId });
    }

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Initialize or increment dailyWordCounter
    user.dailyWordCounter = user.dailyWordCounter || { today: 0 };
    user.dailyWordCounter.today += 1;

    // Save the user document
    user.markModified("dailyWordCounter");
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      dailyWordCounter: user.dailyWordCounter.today,
    });
  } catch (error) {
    console.error("Error in pressCounter:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// get word
exports.getWord = async (req, res, next) => {
  try {
    const wordObj = await Word.findOne({
      "word.en": req.query.en,
      "pack.en": req.query.pack,
    });

    if (!wordObj) {
      // Word not found, return a response indicating 'undefined' or 'not found'
      return res.status(200).json({
        status: "success",
        data: { word: undefined },
      });
    }

    // Word found, return the word object
    res.status(200).json({
      status: "success",
      data: { word: wordObj },
    });
  } catch (error) {
    // Handle any other errors
    console.log(error);
    // return next(new AppError(error.message, 500));
  }
};

// add word
exports.addWord = catchAsync(async (req, res, next) => {
  const { word, pack } = req.body;

  let wordObj = await Word.findOne({ en: word.en, pack });

  if (wordObj) {
    // Check if the Spanish translation exists and English translation is provided
    if (wordObj.infos.es) {
      wordObj.infos = { es: wordObj.infos.es, en: req.body.infos.en };
    }
    // Check if the English translation exists and Spanish translation is provided
    else if (wordObj.infos.en) {
      wordObj.infos = { en: wordObj.infos.en, es: req.body.infos.es };
    }
    await wordObj.save();
  } else {
    // If the word doesn't exist, create a new one
    await Word.create(req.body);
  }

  res.status(201).json({
    status: "success",
  });
});
