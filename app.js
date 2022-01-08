const express = require("express");
const morgan = require("morgan");
const pg = require("pg");
const cors = require("cors");
require("dotenv").config();
const { verifyToken } = require("./middleware/Auth.js");
const {
  registerUser,
  forgotPassword,
  resetPassword,
  login,
  createPin,
  otpVerify,
} = require("./controllers/AuthController");
const { init } = require("./controllers/MailController");
const { getAllUsers } = require("./controllers/UserController");
const {
  PasswordResetValidator,
  PasswordForgotValidator,
  LoginValidator,
  PinValidator,
  RegisterValidator,
  OTPValidator,
} = require("./validators");

const app = express();
const port = 3000;

app.use(express.json());

//initialize mail transporter
init();
//middlewares
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
// get all users
app.get("/users", getAllUsers);
// register
app.post("/register", RegisterValidator, registerUser);
// sign in
app.post("/login", LoginValidator, login);

//Create route for Create Pin
//When the post request is made, the function 'createPin' will run sucessfully
app.post("/pin/create", verifyToken, PinValidator, createPin);
// verify OTP
app.post("/verify", OTPValidator, otpVerify);

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
