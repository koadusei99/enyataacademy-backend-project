const db = require("../models/index");
const { genStr, addMinutes, hashPassword, genOTP } = require("../util");
const { sendMail } = require("../controllers/MailController");
const { validationResult } = require("express-validator");
const { createJWT } = require("../middleware/Auth");
const { errorFormatter } = require("../validators");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { email, password, firstName, lastName, pin, phone } = req.body;

  try {
    // hash password
    const passwordHash = await hashPassword(password);
    //check if user email and phone number are take
    let taken = await db.User.findOne({ where: { email } });
    if (taken) {
      return res.status(400).json({ message: "Email is taken" });
    }

    // create user with data
    const result = await db.User.create({
      email,
      password: passwordHash,
      firstName,
      lastname: lastName,
      phone,
      pin,
    });

    // create OTP
    let code = genOTP();
    let otp = await db.Vcode.create({
      user_id: result.dataValues.id,
      code,
      expires_at: addMinutes(new Date(), 10).toISOString(),
    });

    // send mail with OTP
    sendMail("welcome", { email, firstName }, code);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal error" });
  }

  res.status(201).json({ message: "Account Created" });
};

// PASSWORD RESET
// generate password reset link and mail it to user
const forgotPassword = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { email } = req.body;
  const { User, Vcode } = db.sequelize.models;

  // check if user with email exists
  let user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(400).json({ message: "User does not exist" });
    return;
  }
  let code = genStr(64);
  let expires_at = addMinutes(new Date(), 10).toISOString();
  try {
    // create reset code
    let resetCode = await Vcode.create({
      user_id: user.id,
      code,
      expires_at,
    });

    // send mail with reset code
    sendMail(
      "forgot",
      { email: user.email, firstName: user.firstName },
      resetCode.code
    );

    res.status(200).json({
      message: `Password reset link sent to ${user.email}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occured" });
  }
};

// Reset user password using params from reset link
const resetPassword = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { code } = req.params;
  const { email } = req.query;
  const { password } = req.body;
  const { User, Vcode } = db.sequelize.models;

  // verify reset code
  let resetCode = await Vcode.findOne({ where: { code } });

  if (!resetCode) {
    return res.status(400).json({ message: "Invalid reset code" });
  }

  // verify user
  let user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }
  console.log(user, resetCode);
  if (!(user.id === resetCode.user_id)) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  // check if it's expired
  if (new Date(resetCode.expires_at) < new Date()) {
    return res.status(400).json({ message: "Expired reset code" });
  }

  //reset user's password
  user.password = await hashPassword(password);
  user.save();
  res.status(200).json({ message: "Password reset" });
};

const login = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }
  const { User, Vcode } = db.sequelize.models;

  // extract email and password from request
  const { email, password } = req.body;

  //check if the password matches
  let user = await User.findOne({ where: { email: email } });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  let hashPass = await bcrypt.compare(password, user.password);
  if (!hashPass) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  console.log(hashPass);
  // generate jwt and send to client
  let token = createJWT({ identifier: user.email, name: user.firstName });
  res.json({ message: "Signed in", token });
};

//Create transaction PIN
const createPin = async (req, res) => {
  //Validatationresult takes int he request it goes through the request body(submitted data)
  //and validate it
  //if there are errors it will send as errors
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  //1. Verify if user is signed in
  let user = req.user;

  //getting the models from the database
  const { User } = db.sequelize.models;

  //Fetching user details from database
  let storeDetails = await User.findOne({ where: { email: user.identifier } });

  //2 . Get Pin from User
  let pin = req.body.pin;

  //3. Store Pin from User
  storeDetails.pin = pin;
  await storeDetails.save();

  res.json({ message: "Created Pin Sucessfully", storeDetails, pin });
};

// Verify OTP
const otpVerify = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { otpCode } = req.body;
  const { User, Vcode } = db.sequelize.models;

  // verify reset code
  let OTP = await Vcode.findOne({ where: { code: otpCode } });

  console.log(OTP);
  if (!OTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // verify user
  let user = await User.findOne({ where: { id: OTP.user_id } });
  if (!user) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // check if it's expired
  if (new Date(OTP.expires_at) < new Date()) {
    return res.status(400).json({ message: "Expired OTP" });
  }
  //generate jwt
  let token = createJWT({ name: user.firstName, identifier: user.email });

  res.status(200).json({ message: "User Verified", user: user.email, token });
};

module.exports = {
  registerUser,
  forgotPassword,
  resetPassword,
  login,
  createPin,
  otpVerify,
};
