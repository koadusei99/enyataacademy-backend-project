require("dotenv").config();
const jwt = require("jsonwebtoken");

function genToken(email, firstName) {
  return jwt.sign({ email, firstName }, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
}
