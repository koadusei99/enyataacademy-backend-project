const { validationResult } = require("express-validator");
const { errorFormatter } = require("../validators.js");


//TODO register controller
const registerUser = (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }
  const { email, password, firstName, lastName } = req.body;
  let user = { email, password, firstName, lastName };
  let token = "kudhkdsunds89sdyisud";
  res.status(201).json({ message: "Account Created", token });
};

module.exports = { registerUser };
