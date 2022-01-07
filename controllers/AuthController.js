//TODO register controller
const registerUser = (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  let user = { email, password, firstName, lastName };
  let token = "kudhkdsunds89sdyisud";
  res.status(201).json({ message: "Account Created", token });
};

module.exports = { registerUser };
