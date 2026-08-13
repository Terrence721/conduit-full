const jsonwebtoken = require("jsonwebtoken");

// jwt.js reads process.env.JWT_KEY at module-load time (top-level const),
// not lazily inside the functions - so it has to be re-required fresh after
// stubbing the env, same as models/index.js.
const freshJwtHelper = () => {
  delete require.cache[require.resolve("./jwt")];
  return require("./jwt");
};

describe("helper/jwt.js", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("jwtSign produces a token jwtVerify can verify back to the same payload", async () => {
    const { jwtSign, jwtVerify } = freshJwtHelper();

    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
    });
    const decoded = await jwtVerify(token);

    expect(decoded.username).toBe("jake");
    expect(decoded.email).toBe("jake@jake.jake");
  });

  test("jwtSign only includes username and email, not other payload fields", async () => {
    const { jwtSign, jwtVerify } = freshJwtHelper();

    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
      password: "should-not-leak",
    });
    const decoded = await jwtVerify(token);

    expect(decoded).not.toHaveProperty("password");
  });

  test("jwtSign sets a 7-day expiration", async () => {
    const { jwtSign } = freshJwtHelper();

    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
    });
    const decoded = jsonwebtoken.decode(token);

    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    expect(decoded.exp - decoded.iat).toBe(sevenDaysInSeconds);
  });

  test("jwtVerify rejects a token signed with a different secret", async () => {
    const { jwtVerify } = freshJwtHelper();
    const forgedToken = jsonwebtoken.sign({ username: "eve" }, "wrong-secret");

    await expect(jwtVerify(forgedToken)).rejects.toThrow();
  });

  test("jwtVerify rejects a token using a different algorithm, even with the right secret", async () => {
    const { jwtVerify } = freshJwtHelper();
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
