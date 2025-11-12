const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

//app.get("/", (req, res) => {
   //login.html lives in public/login/
//  res.sendFile(path.join(__dirname, "public", "login", "login.html"));
//});

app.get("/", (req, res) => {
  // homepage.html lives in public/homepage/
  res.sendFile(path.join(__dirname, "public", "homepage", "homepage.html"));
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
