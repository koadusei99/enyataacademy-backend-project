const db = require("../models/index");
const { genStr, addMinutes, hashPassword } = require("../util");
const { sendMail } = require("../controllers/MailController");
const { validationResult } = require("express-validator");
const { errorFormatter } = require("../validators");

//TODO register controller
const registerUser = (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  let user = { email, password, firstName, lastName };
  let token = "kudhkdsunds89sdyisud";
  res.status(201).json({ message: "Account Created", token });
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
    // sendMail(
    //   "forgot",
    //   { email: user.email, firstName: user.firstName },
    //   resetCode.code
    // );

    res.status(200).json({
      message: `Password reset link sent to ${user.email}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occured" });
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { code } = req.params;
  const { email } = req.query;
  const { password } = req.body;
  const { User, Vcode } = db.sequelize.models;

  // check if password & confirm match
  // if (password !== confirmPassword) {
  //   return res.status(400).json({ message: "Passwords do not match" });
  // }

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
  if (new Date(resetCode.expires_at) > new Date()) {
    return res.status(400).json({ message: "Expired reset code" });
  }

  //reset user's password
  user.password = await hashPassword(password);
  user.save();

  res.status(200).json({ message: "Password reset" });
};

module.exports = { registerUser, forgotPassword, resetPassword };
