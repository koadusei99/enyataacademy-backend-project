const { body } = require("express-validator");

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // return `${location}-${param}-${msg}`;
  return `${msg}`;
};

const RegisterValidator = [
  body("firstName")
    .exists({ checkFalsy: true })
    .withMessage("firstName is required")
    .bail()
    .trim(),
  body("lastName")
    .exists({ checkFalsy: true })
    .withMessage("lastName is required")
    .trim(),

  body("email")
    .exists({ checkFalsy: true })
    .withMessage("email is required")
    .trim(),

  body("password")
    .exists({ checkFalsy: true })
    .withMessage("password is required")
    .trim(),
];

module.exports = { errorFormatter, RegisterValidator };
