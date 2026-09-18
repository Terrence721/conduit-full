// Dynamically re-imports helper/jwt so it re-reads process.env.JWT_KEY
// after vi.resetModules() -- these tests stub that env var per-test via
// vi.stubEnv(), and jwt.ts captures it into a module-level const at import
// time, so a static top-level import here would silently sign with a stale
// key instead of the test's stubbed one.
const tokenFor = async (user: any) => {
  const { jwtSign } = (await import("../helper/jwt")).default;
  return jwtSign(user);
};

export = tokenFor;
