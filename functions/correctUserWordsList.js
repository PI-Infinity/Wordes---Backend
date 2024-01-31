app.get("/correctWords", async (req, res) => {
  try {
    const users = await Users.find({});
    const allowedWords = new Set(list.map((word) => word.en));

    users.forEach((user) => {
      Object.keys(user.stats).forEach((key) => {
        const originalLength = user.stats[key].length;
        user.stats[key] = user.stats[key].filter((item) =>
          allowedWords.has(item.en)
        );
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

    res.send(`
        <html>
          <head>
            <title>User Names</title>
          </head>
          <body>
            <h1>User Names</h1>
            <ul>
              <!-- User names can be listed here -->
            </ul>
          </body>
        </html>
      `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});
