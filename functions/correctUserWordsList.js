const Users = require("../src/models/userModel");
const list = require("../words/wordsList");
const express = require("express");

const correctUserWordsBase = async () => {
  try {
    /**
     * Business Packs
     */
    const allowedWordsBusiness = new Set(
      list
        .map((word) => {
          if (
            word.category === "business" &&
            (!word.en.includes(" ") || word.en.startsWith("To "))
          ) {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    const allowedPhrasesBusiness = new Set(
      list
        .map((word) => {
          if (
            word.category === "business" &&
            word.en.includes(" ") &&
            !word.en.startsWith("To ")
          ) {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    /**
     * Nouns
     */
    const allowedWordsNounsA1 = new Set(
      list
        .map((word) => {
          if (word.type === "noun" && word.level === "A1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsNounsA2 = new Set(
      list
        .map((word) => {
          if (word.type === "noun" && word.level === "A2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsNounsB1 = new Set(
      list
        .map((word) => {
          if (word.type === "noun" && word.level === "B1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsNounsB2 = new Set(
      list
        .map((word) => {
          if (word.type === "noun" && word.level === "B2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsNounsC1 = new Set(
      list
        .map((word) => {
          if (word.type === "noun" && word.level === "C1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    /**
     * verbs
     */
    const allowedWordsVerbsA1 = new Set(
      list
        .map((word) => {
          if (word.type === "verb" && word.level === "A1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsVerbsA2 = new Set(
      list
        .map((word) => {
          if (word.type === "verb" && word.level === "A2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsVerbsB1 = new Set(
      list
        .map((word) => {
          if (word.type === "verb" && word.level === "B1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsVerbsB2 = new Set(
      list
        .map((word) => {
          if (word.type === "verb" && word.level === "B2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsVerbsC1 = new Set(
      list
        .map((word) => {
          if (word.type === "verb" && word.level === "C1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    /**
     * Adjectives
     */

    const allowedWordsAdjectivesA1 = new Set(
      list
        .map((word) => {
          if (word.type === "adjective" && word.level === "A1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    const allowedWordsAdjectivesA2 = new Set(
      list
        .map((word) => {
          if (word.type === "adjective" && word.level === "A2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdjectivesB1 = new Set(
      list
        .map((word) => {
          if (word.type === "adjective" && word.level === "B1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdjectivesB2 = new Set(
      list
        .map((word) => {
          if (word.type === "adjective" && word.level === "B2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdjectivesC1 = new Set(
      list
        .map((word) => {
          if (word.type === "adjective" && word.level === "C1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    /**
     * Adverbs
     */

    const allowedWordsAdverbsA1 = new Set(
      list
        .map((word) => {
          if (word.type === "adverb" && word.level === "A1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdverbsA2 = new Set(
      list
        .map((word) => {
          if (word.type === "adverb" && word.level === "A2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdverbsB1 = new Set(
      list
        .map((word) => {
          if (word.type === "adverb" && word.level === "B1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdverbsB2 = new Set(
      list
        .map((word) => {
          if (word.type === "adverb" && word.level === "B2") {
            return word.en;
          }
        })
        .filter((i) => i)
    );
    const allowedWordsAdverbsC1 = new Set(
      list
        .map((word) => {
          if (word.type === "adverb" && word.level === "C1") {
            return word.en;
          }
        })
        .filter((i) => i)
    );

    const users = await Users.find({});

    users
      .filter(
        (i) =>
          i.email === "tornike.pirtakhia@gmail.com" ||
          i.email === "chkheidze.maka64@gmail.com"
      )
      .forEach((user) => {
        Object.keys(user.stats).forEach((key) => {
          const originalLength = user.stats[key].length;
          user.stats[key] = user.stats[key].filter((item) => {
            if (key === "Common Used Words in Business") {
              return allowedWordsBusiness.has(item.en);
            } else if (key === "Common Used Phrases in Business") {
              return allowedPhrasesBusiness.has(item.en);
            } else if (key === "Common Used Nouns A1") {
              return allowedWordsNounsA1.has(item.en);
            } else if (key === "Common Used Nouns A2") {
              return allowedWordsNounsA2.has(item.en);
            } else if (key === "Common Used Nouns B1") {
              return allowedWordsNounsB1.has(item.en);
            } else if (key === "Common Used Nouns B2") {
              return allowedWordsNounsB2.has(item.en);
            } else if (key === "Common Used Nouns C1") {
              return allowedWordsNounsC1.has(item.en);
            } else if (key === "Common Used Verbs A1") {
              return allowedWordsVerbsA1.has(item.en);
            } else if (key === "Common Used Verbs A2") {
              return allowedWordsVerbsA2.has(item.en);
            } else if (key === "Common Used Verbs B1") {
              return allowedWordsVerbsB1.has(item.en);
            } else if (key === "Common Used Verbs B2") {
              return allowedWordsVerbsB2.has(item.en);
            } else if (key === "Common Used Verbs C1") {
              return allowedWordsVerbsC1.has(item.en);
            } else if (key === "Common Used Adjectives A1") {
              return allowedWordsAdjectivesA1.has(item.en);
            } else if (key === "Common Used Adjectives A2") {
              return allowedWordsAdjectivesA2.has(item.en);
            } else if (key === "Common Used Adjectives B1") {
              return allowedWordsAdjectivesB1.has(item.en);
            } else if (key === "Common Used Adjectives B2") {
              return allowedWordsAdjectivesB2.has(item.en);
            } else if (key === "Common Used Adjectives C1") {
              return allowedWordsAdjectivesC1.has(item.en);
            } else if (key === "Common Used Adverbs A1") {
              return allowedWordsAdverbsA1.has(item.en);
            } else if (key === "Common Used Adverbs A2") {
              return allowedWordsAdverbsA2.has(item.en);
            } else if (key === "Common Used Adverbs B1") {
              return allowedWordsAdverbsB1.has(item.en);
            } else if (key === "Common Used Adverbs B2") {
              return allowedWordsAdverbsB2.has(item.en);
            } else if (key === "Common Used Adverbs C1") {
              return allowedWordsAdverbsC1.has(item.en);
            }
          });
          // Mark as modified if there are changes
          if (user.stats[key].length !== originalLength) {
            user.markModified("stats");
          }
        });
      });

    // Save each modified user back to the database
    for (let user of users) {
      // if (user.email.includes("pirtakhia")) {
      await user.save({ validateBeforeSave: false });
      // }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
};

module.exports = { correctUserWordsBase };
