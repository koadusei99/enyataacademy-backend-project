"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Vcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Vcode.init(
    {
      user_id: DataTypes.INTEGER,
      code: DataTypes.STRING,
      expires_at: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Vcode",
    }
  );
  return Vcode;
};
