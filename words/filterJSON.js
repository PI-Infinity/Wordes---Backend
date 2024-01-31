const fs = require("fs");

const list = require("../techList.json");
const listKa = require("../techListKa.json");

function merge(data) {
  return list.map((item, index) => {
    let ka = listKa[index];
    return { word: item.word, explain: { ka: ka.explain, en: item.explain } };
  });
}

const uniqueWordList = merge(list);

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
processAndSave();
