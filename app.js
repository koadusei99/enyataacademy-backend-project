const express = require("express");
const morgan = require("morgan");
const pg = require("pg");
const cors = require("cors");
require("dotenv").config();
const { verifyToken, createJWT } = require("./middleware/Auth.js");
const {
  registerUser,
  forgotPassword,
  resetPassword,
  login,
  createPin,
} = require("./controllers/AuthController");
const { init, sendMail } = require("./controllers/MailController");
const {
  errorFormatter,
  PasswordResetValidator,
  PasswordForgotValidator,
  LoginValidator,
  PinValidator,
} = require("./validators");

const app = express();
const port = 3000;
const { RegisterValidator } = require("./validators.js");

app.use(express.json());

init();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

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
app.post("/login", LoginValidator, login);

//Create route for Create Pin
//When the post request is made, the function 'createPin' will run sucessfully
app.post("/pin/create", verifyToken, PinValidator, createPin);

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
