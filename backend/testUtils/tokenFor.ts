import freshJwt from "./freshJwt";

// Composes through freshJwt to sign with the current process.env.JWT_KEY --
// these tests stub that env var per-test via vi.stubEnv(), and a static
// top-level import of helper/jwt would bind to a stale key captured before
// the stub ever ran.
const tokenFor = async (user: any) => {
  const { jwtSign } = await freshJwt();
  return jwtSign(user);
};

export = tokenFor;
