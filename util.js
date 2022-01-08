const crypto = require("crypto");
const path = require("path");
const bcrypt = require("bcryptjs");

const emailsDir = path.join(__dirname, "mails");

const genStr = (length) => {
  return crypto.randomBytes(length).toString("hex");
};
const genOTP = () => {
  return Math.random().toString().substring(2, 6);
};
const addMinutes = (dt, minutes) => {
  return new Date(dt.getTime() + minutes * 60000);
};
const hashPassword = async (pass) => {
  // add salt and hash password
  const salt = await bcrypt.genSalt();
  let password = await bcrypt.hash(pass, salt);
  return password;
};
module.exports = { emailsDir, genStr, addMinutes, hashPassword, genOTP };
