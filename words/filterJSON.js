const fs = require("fs");

const list = require("../words/wordsList.json");

console.log(
  list.filter((i) => i.type === "adjective" && i.level === "B1").length
);

const allowedWordsNounsA2 = new Set(
  list
    .map((word) => {
      if (word.type === "adjective" && word.level === "B1") {
        return word.en;
      }
    })
    .filter((i) => i)
);
console.log(Array.from(allowedWordsNounsA2).length);

// // Assuming 'list' is your original array of objects
// const filteredList = list.filter((i) => i.type === "noun" && i.level === "B1");

// // Count occurrences
// const countOccurrences = filteredList.reduce((acc, { en }) => {
//   acc[en] = (acc[en] || 0) + 1;
//   return acc;
// }, {});

// // Find max occurrence
// const maxOccurrence = Math.max(...Object.values(countOccurrences));

// // Find the word(s) with the max occurrence
// const mostFrequentWords = Object.keys(countOccurrences).filter(
//   (key) => countOccurrences[key] === maxOccurrence
// );

// // Assuming you want to return the full object(s) for the words found
// const mostFrequentObjects = filteredList.filter(({ en }) =>
//   mostFrequentWords.includes(en)
// );

// console.log(mostFrequentObjects); // This will log the object(s) with the most occurrences

// console.log(l);

// const list = require("../techList.json");
// const listKa = require("../techListKa.json");

// function merge(data) {
//   return list.map((item, index) => {
//     let ka = listKa[index];
//     return { word: item.word, explain: { ka: ka.explain, en: item.explain } };
//   });
// }

// const uniqueWordList = merge(list);

// Main function to process and save the file
function processAndSave() {
  try {
    // Write the updated data to a new file
    fs.writeFile(
      "merged.json",
      JSON.stringify(uniqueWordList, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("Updated data saved successfully.");
      }
    );
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

// Call the main function
// processAndSave();
