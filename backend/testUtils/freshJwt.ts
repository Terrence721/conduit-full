// helper/jwt.ts captures process.env.JWT_KEY into a module-level const at
// import time -- resetting the module cache and re-importing gets a fresh
// instance bound to whatever the env var is right now.
const freshJwt = async () => {
  vi.resetModules();
  return (await import("../helper/jwt")).default;
};

export = freshJwt;
