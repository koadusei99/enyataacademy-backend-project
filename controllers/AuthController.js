const { validationResult } = require("express-validator");
const { errorFormatter } = require("../validators.js");
const db = require("../models/index.js");
const bcrypt = require("bcrypt");

//TODO register controller
const registerUser = async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  const { email, password, firstName, lastName, pin, phone } = req.body;
  const hashPassword = await bcrypt.hash(password, 12);
  const result = await db.User.create({
    email,
    password: hashPassword,
    firstName,
    lastname: lastName,
    phone,
    pin,
  });
  const token = "dfgkagaisydahksfkaiua";
  res.status(201).json({ message: "Account Created", token, result });
};

module.exports = { registerUser };
