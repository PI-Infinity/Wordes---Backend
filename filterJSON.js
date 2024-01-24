const fs = require("fs");

// Assuming wordsData is your array of objects
const wordsData = require("./wordsList.json");
const list = require("./businessWords2.json");
const list2 = require("./newWords.json");

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

// Function to add or update the category field
// function updateCategory(data, list) {
//   return data.map((item) => {
//     // Check if the lowercase version of item.en is included in the list
//     const w = list.find((i) => i.toLowerCase() === item.en.toLowerCase());
//     if (w) {
//       item.category = "business"; // Add or update the category field
//     }
//     return item;
//   });
// }

function updateCategory() {
  const combinedArray = wordsData.concat(list2);
  return combinedArray;
}

// Main function to process and save the file
function processAndSave() {
  try {
    const uniqueData = removeDuplicates(wordsData);
    const updatedData = updateCategory(uniqueData, list);

    // Write the updated data to a new file
    fs.writeFile(
      "newList.json",
      JSON.stringify(updatedData, null, 2),
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
