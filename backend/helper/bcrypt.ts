const bcrypt = require("bcrypt");

const bcryptHash = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

const bcryptCompare = async (
  password: string,
  hasPwd: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hasPwd);
};

export = { bcryptHash, bcryptCompare };
