const express = require("express");
const morgan = require("morgan");
const pg = require("pg");
require("dotenv").config();
const { verifyToken, createJWT } = require("./middleware/Auth.js");
const {
  registerUser,
  forgotPassword,
  resetPassword,
} = require("./controllers/AuthController");
const { init, sendMail } = require("./controllers/MailController");
const {
  errorFormatter,
  PasswordResetValidator,
  PasswordForgotValidator,
} = require("./validators");

const app = express();
const port = 3000;

init();
app.use(morgan("dev"));
app.use(express.json());

// DATABASE CONNECTION
let conString = process.env.DATABASE_URL;
let client = new pg.Client(conString);

client.connect(function (err) {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
  client.query('SELECT NOW() AS "theTime"', function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    console.log(result.rows[0].theTime);
    console.log("DB Connected Successfully!");
    client.end();
  });
});

//ROUTES
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/register", registerUser);

// PASSWORD RESET
app.post("/password/forgot", PasswordForgotValidator, forgotPassword);
app.post("/password/reset/:code", PasswordResetValidator, resetPassword);

//test
app.get("/test/auth", verifyToken, (req, res) => {
  let success = false;
  let { user } = req;
  if (!user) {
    return res.status(401).json({ success, message: "Unauthenticated", user });
  }
  res.status(200).json({ message: "Mail Sent", user });
});

app.get("/test/jwt", (req, res) => {
  let token = createJWT({
    identifier: "academy2@enyata.com",
    name: "Academy2.0",
  });
  res.status(200).json({ token });
});

app.get("/test/mail", async (req, res) => {
  let sent = await sendMail(
    "welcome",
    {
      firstName: "Kwaku",
      email: "wonpaidragon900@gmail.com",
    },
    "CLAPPP"
  );

  res.status(200).json({ message: "Mail Sent", mail: sent });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
