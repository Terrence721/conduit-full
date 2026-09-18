const createUser = async (db: any, overrides = {}) => {
  return db.User.create({
    username: "jake",
    email: "jake@jake.jake",
    password: "hashed",
    ...overrides,
  });
};

export = createUser;
