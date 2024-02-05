const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Word = require("../models/wordModel");
const WordsList = require("../../words/wordsList.json");

// get users
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // sort the users list
  let sorted;
  if (req.query.sort === "lastregister") {
    sorted = users.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (req.query.sort === "firstregister") {
    sorted = users.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } else if (req.query.sort === "lastlogin") {
    sorted = users.sort(
      (a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt)
    );
  } else {
    sorted = users.sort(
      (a, b) => new Date(a.lastLoginAt) - new Date(b.lastLoginAt)
    );
  }

  // filter by register type
  let registeredBy;
  if (req.query.registertype === "all") {
    registeredBy = sorted;
  } else {
    if (req.query.registertype === "notauthorized") {
      registeredBy = sorted?.filter((i) => i.registerType === "not authorized");
    } else {
      registeredBy = sorted?.filter(
        (i) => i.registerType === req.query.registertype
      );
    }
  }

  // filter by device
  let byDevice;
  if (req.query.registerdevice === "all") {
    byDevice = registeredBy;
  } else {
    byDevice = registeredBy?.filter(
      (i) => i.registerDevice === req.query.registerdevice
    );
  }

  // filter by push notification
  let notificated;
  if (req.query.pushnotifications === "all") {
    notificated = byDevice;
  } else {
    if (req.query.pushnotifications === "true") {
      notificated = byDevice?.filter((i) => i.pushNotifications);
    } else {
      notificated = byDevice?.filter((i) => !i.pushNotifications);
    }
  }

  // get data by piece
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const list = notificated.slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    data: {
      list: {
        length: notificated?.length,
        list: list.map((item, index) => {
          return {
            _id: item._id,
            name: item.name,
            email: item.email,
            registerType: item.registerType,
            registerDevice: item.registerDevice,
            pushNotifications: item.pushNotifications,
            activePack: item.activePack,
            packs: item.packs,
            createdAt: item.createdAt,
            lastLoginAt: item.lastLoginAt,
          };
        }),
      },
    },
  });
});

// get user stat
exports.getUserStats = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  const getTotalCorrectAnswersByPack = (stats) => {
    return Object.entries(stats).reduce((result, [packName, words]) => {
      result[packName] = words.reduce((sum, word) => sum + word.total, 0);
      return result;
    }, {});
  };

  const statistics = getTotalCorrectAnswersByPack(user.stats);

  console.log(statistics);

  // Unlock packs
  const packThresholds = {
    "Common Used Nouns A1": {
      total:
        WordsList?.filter((i) => i.type === "noun" && i.level === "A1").length *
        5,
      nextPack: "Common Used Nouns A2",
    },
    "Common Used Nouns A2": {
      total:
        WordsList?.filter((i) => i.type === "noun" && i.level === "A2").length *
        5,
      nextPack: "Common Used Nouns B1",
    },
    "Common Used Nouns B1": {
      total:
        WordsList?.filter((i) => i.type === "noun" && i.level === "B1").length *
        5,
      nextPack: "Common Used Nouns B2",
    },
    "Common Used Nouns B2": {
      total:
        WordsList?.filter((i) => i.type === "noun" && i.level === "B2").length *
        5,
      nextPack: "Common Used Nouns C1",
    },
    "Common Used Verbs A1": {
      total:
        WordsList?.filter((i) => i.type === "verb" && i.level === "A1").length *
        5,
      nextPack: "Common Used Verbs A2",
    },
    "Common Used Verbs A2": {
      total:
        WordsList?.filter((i) => i.type === "verb" && i.level === "A2").length *
        5,
      nextPack: "Common Used Verbs B1",
    },
    "Common Used Verbs B1": {
      total:
        WordsList?.filter((i) => i.type === "verb" && i.level === "B1").length *
        5,
      nextPack: "Common Used Verbs B2",
    },
    "Common Used Verbs B2": {
      total:
        WordsList?.filter((i) => i.type === "verb" && i.level === "B2").length *
        5,
      nextPack: "Common Used Verbs C1",
    },
    "Common Used Adjectives A1": {
      total:
        WordsList?.filter((i) => i.type === "adjective" && i.level === "A1")
          .length * 5,
      nextPack: "Common Used Adjectives A2",
    },
    "Common Used Adjectives A2": {
      total:
        WordsList?.filter((i) => i.type === "adjective" && i.level === "A2")
          .length * 5,
      nextPack: "Common Used Adjectives B1",
    },
    "Common Used Adjectives B1": {
      total:
        WordsList?.filter((i) => i.type === "adjective" && i.level === "B1")
          .length * 5,
      nextPack: "Common Used Adjectives B2",
    },
    "Common Used Adjectives B2": {
      total:
        WordsList?.filter((i) => i.type === "adjective" && i.level === "B2")
          .length * 5,
      nextPack: "Common Used Adjectives C1",
    },
    "Common Used Adverbs A1": {
      total:
        WordsList?.filter((i) => i.type === "adverb" && i.level === "A1")
          .length * 5,
      nextPack: "Common Used Adverbs A2",
    },
    "Common Used Adverbs A2": {
      total:
        WordsList?.filter((i) => i.type === "adverb" && i.level === "A2")
          .length * 5,
      nextPack: "Common Used Adverbs B1",
    },
    "Common Used Adverbs B1": {
      total:
        WordsList?.filter((i) => i.type === "adverb" && i.level === "B1")
          .length * 5,
      nextPack: "Common Used Adverbs B2",
    },
    "Common Used Adverbs B2": {
      total:
        WordsList?.filter((i) => i.type === "adverb" && i.level === "B2")
          .length * 5,
      nextPack: "Common Used Adverbs C1",
    },
  };

  const stat = Object.keys(statistics)
    .map((key) => {
      let percent;
      if (packThresholds[key]) {
        percent = (statistics[key] / packThresholds[key].total) * 100;
      }
      if (percent) {
        const logString = { pack: key, percent: percent };
        return logString; // Returning the string for each element
      }
    })
    .filter((i) => i);

  res.status(200).json({
    status: "success",
    data: {
      userStats: user.dailyWordCounter,
      wordsStats: stat,
    },
  });
});

// get charts
exports.getCharts = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // returned user
  const returnedUser = users
    .map((item) => {
      if (item.dailyWordCounter) {
        if (item.dailyWordCounter.history) {
          let lngth = item.dailyWordCounter.history.filter(
            (i) => i.dailyTotal > 0
          ).length;
          if (lngth > 1) {
            return item;
          }
        }
      } else {
        return null;
      }
    })
    .filter((it) => it).length;

  // average word count
  let counts = users
    .map((item, index) => {
      if (item.dailyWordCounter) {
        let today = item.dailyWordCounter.today;
        let history = 0;
        let historyLength = 0;
        if (item.dailyWordCounter.history) {
          let unique = item.dailyWordCounter.history.reduce(
            (acc, current) => {
              const existing = acc.map.get(current.date);
              if (!existing) {
                // If the date is not already in the map, add it
                acc.map.set(current.date, current);
                acc.unique.push(current);
              } else if (current.dailyTotal > existing.dailyTotal) {
                // If the current item has a higher dailyTotal, replace the existing one
                acc.map.set(current.date, current);
                const existingIndex = acc.unique.findIndex(
                  (item) => item.date === current.date
                );
                acc.unique[existingIndex] = current;
              }
              // If the dailyTotal is not higher, do nothing (keep the existing item)
              return acc;
            },
            { map: new Map(), unique: [] }
          ).unique;
          history = unique
            .filter((i) => i.dailyTotal > 0)
            .reduce((accumulator, currentObject) => {
              return accumulator + currentObject.dailyTotal;
            }, 0);

          historyLength = item.dailyWordCounter.history.length;
          return {
            name: item.name,
            totalCounts: history,
            activeDays: unique.filter((i) => i.dailyTotal > 0).length,
          };
        }
      } else {
        return null;
      }
    })
    .filter((i) => i);

  let averageDailyUsage =
    counts.reduce((accumulator, currentObject) => {
      return accumulator + currentObject.totalCounts;
    }, 0) /
    counts.reduce((accumulator, currentObject) => {
      return accumulator + currentObject.activeDays;
    }, 0);

  // active packs
  const packCounts = users.reduce((accumulator, user) => {
    // Use 'Common Used Nouns A1' as default if activePack is not defined
    const category = user.activePack || "Common Used Nouns A1";

    // Increment the count for the category
    accumulator[category] = (accumulator[category] || 0) + 1;

    return accumulator;
  }, {});

  /**
   * define daily activity
   */
  function calculateDailyActivity(users) {
    const today = new Date();
    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(today.getDate() - 30);

    // Format today's date as a string
    const todayFormatted = today.toISOString().split("T")[0];

    // Generate dates for the last 30 days
    const datesInLastThirtyDays = [];
    for (
      let d = new Date(lastThirtyDays);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      datesInLastThirtyDays.push(d.toISOString().split("T")[0]);
    }

    // Initialize activity counts for each date in the last 30 days
    const activityCounts = datesInLastThirtyDays.reduce((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {});

    // Count user activity
    users.forEach((user) => {
      if (user.dailyWordCounter) {
        // Count today's activity
        if (
          todayFormatted in activityCounts &&
          user.dailyWordCounter.today > 0
        ) {
          activityCounts[todayFormatted] += 1;
        }

        // Count historical activity
        if (user.dailyWordCounter.history) {
          user.dailyWordCounter.history.forEach((historyEntry) => {
            const date = new Date(historyEntry.date)
              .toISOString()
              .split("T")[0];
            if (
              activityCounts.hasOwnProperty(date) &&
              historyEntry.dailyTotal > 0
            ) {
              activityCounts[date] += 1;
            }
          });
        }
      }
    });

    // Convert to an array of { date, total } objects
    const dailyUsage = Object.keys(activityCounts).map((date) => {
      return { date: date, total: activityCounts[date] };
    });

    let maxTotal = 0;
    dailyUsage.reverse().forEach((day) => {
      if (day.total > maxTotal) {
        maxTotal = day.total;
      }
    });

    return { dailyUsage, maxTotal };
  }

  const dailyUsage = calculateDailyActivity(users);

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        totalUsers: users?.length,
        registerTypes: {
          email: users.filter((i) => i.registerType === "email").length,
          google: users.filter((i) => i.registerType === "google").length,
          apple: users.filter((i) => i.registerType === "apple").length,
          notAuthorized: users.filter(
            (i) => i.registerType === "not authorized"
          ).length,
        },
        registerDevices: {
          ios: users.filter((i) => i.registerDevice === "ios").length,
          android: users.filter((i) => i.registerDevice === "android").length,
        },
        returnedUsers: returnedUser,
        averageDailyUsage: averageDailyUsage.toFixed(0),
        mostPopularPacks: packCounts,
        dailyUsage: dailyUsage,
      },
    },
  });
});
