const express = require("express");
const { registerUser } = require("./controllers/AuthController");
const app = express();
const port = 3000;
const {RegisterValidator} = require('./validators.js')


app.use(express.json())



app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", RegisterValidator, registerUser);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
