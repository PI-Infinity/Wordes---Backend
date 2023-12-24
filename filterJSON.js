const fs = require("fs");
const filePath = "wordsList.json"; // The name of your JSON file

// Read the JSON file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  try {
    // Parse the JSON data.
    const jsonData = JSON.parse(data);

    // Modify items where the "type" property is 'noun'
    const modifiedData = jsonData.map((item) => {
      // Check if the type is 'noun' and uppercase the first letter of the English representation
      if (item.type === "noun" && typeof item.en === "string") {
        item.en = item.en.charAt(0).toLowerCase() + item.en.slice(1);
      }

      // If type is an array, convert it to a string
      if (Array.isArray(item.type)) {
        item.type = item.type.join(", ");
      }

      return item;
    });

    // Define the new file path
    const newFilePath = "modifiedWordsList2.json";

    // Write the modified data to a new JSON file
    fs.writeFile(
      newFilePath,
      JSON.stringify(modifiedData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Modified JSON data saved successfully to " + newFilePath);
      }
    );
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
  }
});
