import createUser from "./createUser";

// Controller-level tests call controller functions directly, bypassing real
// auth middleware, so req.loggedUser needs a fake token already attached --
// unlike route-level tests, which go through real HTTP auth and derive an
// actual signed JWT separately via tokenFor().
const createUserWithFakeToken = async (db: any, overrides = {}) => {
  const user = await createUser(db, overrides);
  user.dataValues.token = "fake-token";
  return user;
};

export = createUserWithFakeToken;
