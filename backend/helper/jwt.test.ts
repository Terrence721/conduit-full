export {};

const jsonwebtoken = require("jsonwebtoken");

// jwt.ts reads process.env.JWT_KEY at module-load time (top-level const),
// not lazily inside the functions - so it has to be freshly re-imported
// after stubbing the env, same as config.ts and models/index.ts.
const freshJwtHelper = async () => {
  vi.resetModules();
  return (await import("./jwt")).default;
};

describe("helper/jwt.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("jwtSign produces a token jwtVerify can verify back to the same payload", async () => {
    const { jwtSign, jwtVerify } = await freshJwtHelper();

    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
    });
    const decoded: any = await jwtVerify(token);

    expect(decoded.username).toBe("jake");
    expect(decoded.email).toBe("jake@jake.jake");
  });

  test("jwtSign only includes username and email, not other payload fields", async () => {
    const { jwtSign, jwtVerify } = await freshJwtHelper();

    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
      password: "should-not-leak",
    } as any);
    const decoded = await jwtVerify(token);

    expect(decoded).not.toHaveProperty("password");
  });

  test("jwtSign sets a 7-day expiration", async () => {
    const { jwtSign } = await freshJwtHelper();

    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
    });
    const decoded: any = jsonwebtoken.decode(token);

    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    expect(decoded.exp - decoded.iat).toBe(sevenDaysInSeconds);
  });

  test("jwtVerify rejects a token signed with a different secret", async () => {
    const { jwtVerify } = await freshJwtHelper();
    const forgedToken = jsonwebtoken.sign({ username: "eve" }, "wrong-secret");

    await expect(jwtVerify(forgedToken)).rejects.toThrow();
  });

  test("jwtVerify rejects a token using a different algorithm, even with the right secret", async () => {
    const { jwtVerify } = await freshJwtHelper();
    // Proves the explicit algorithms: ["HS256"] restriction actually does
    // something, not just documents intent - same secret, wrong algorithm.
    const forgedToken = jsonwebtoken.sign(
      { username: "eve" },
      "test-secret-key",
      { algorithm: "HS384" },
    );

    await expect(jwtVerify(forgedToken)).rejects.toThrow();
  });
});
