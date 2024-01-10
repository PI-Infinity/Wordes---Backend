const fs = require("fs");

// Assuming wordsData is your array of objects
const wordsData = require("./wordsList.json");

function removeDuplicates(data) {
  const seen = new Set();
  return data.filter((item) => {
    const key = `${item.en}|${item.type}`;
    if (seen.has(key)) {
      return false; // Skip this item as it's a duplicate
    } else {
      seen.add(key);
      return true; // Keep this item as it's the first occurrence
    }
  });
}

// Main function to process and save the file
function processAndSave() {
  try {
    const uniqueData = removeDuplicates(wordsData);

    // Write the unique data to a new file
    fs.writeFile(
      "uniqueWords.json",
      JSON.stringify(uniqueData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("Unique data saved successfully.");
      }
    );
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

// Call the main function
processAndSave();
