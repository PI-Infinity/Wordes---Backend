const fs = require("fs");

const { list } = require("./business.js"); // Your provided list

function createJsonFromList(list) {
  // Split the list into lines
  const lines = list.split("\n");

  // Map each line to an object
  const wordsArray = lines.map((line) => {
    const [count, word] = line.split(". ").map((s) => s.trim());
    return { count: parseInt(count, 10), word: word };
  });

  // Filter out any invalid entries
  const filteredWordsArray = wordsArray.filter(
    (item) => !isNaN(item.count) && item.word
  );

  // Convert array to JSON string
  const jsonString = JSON.stringify(filteredWordsArray, null, 2);

  // Write to a file
  fs.writeFile("businessWords.json", jsonString, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("JSON file created successfully.");
    }
  });
}

// Call the function
createJsonFromList(list);
