const db = require("../models/index");

const getAllUsers = async (req, res) => {
  const { User } = db.sequelize.models;

  try {
    let users = await User.findAll();
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal error" });
  }
};

module.exports = { getAllUsers };
