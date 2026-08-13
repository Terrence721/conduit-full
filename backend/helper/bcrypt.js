const bcrypt = require("bcrypt");

module.exports.bcryptHash = async (password) => {
  return bcrypt.hash(password, 12);
};

module.exports.bcryptCompare = async (password, hasPwd) => {
  return bcrypt.compare(password, hasPwd);
};
