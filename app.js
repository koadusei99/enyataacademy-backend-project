const express = require("express");
const app = express();
const port = 3000;
const {getUserInfo} = require('./authController.js')

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/userinfo', getUserInfo)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
