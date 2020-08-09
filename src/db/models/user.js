'use strict';
const bcrypt = require("bcrypt");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user.init({
    name: DataTypes.STRING,
    role: DataTypes.STRING,
    email: DataTypes.STRING,
    hashedPassword: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
    hooks: {
      beforeCreate: user => {
        const hashCost = 10;
        user.hashedPassword = bcrypt.hashSync(user.hashedPassword, hashCost);
      }
    }
  });

  user.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.hashedPassword);
  };

  user.prototype.bcrypt = function (password) {
    // authentication will take approximately 13 seconds
    // https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
    const hashCost = 10;
    this.hashedPassword = bcrypt.hashSync(password, hashCost);
    this.save();
  };

  return user;
};