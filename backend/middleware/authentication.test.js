// The only genuine external dependency here is DB access via the User
// model - faked below via require.cache, since it needs a live Postgres
// this environment doesn't have (vi.mock() doesn't intercept plain CJS
// require() the way it does ESM imports, so a real require.cache entry is
// injected instead). jwtVerify/jwtSign are the real modules: real signing,
// real verification, no mocking, so the actual token-handling logic is
// exercised for real.
const modelsPath = require.resolve("../models");
const authenticationPath = require.resolve("./authentication");

const fakeUser = { findOne: vi.fn() };

const loadVerifyToken = () => {
  delete require.cache[authenticationPath];
  require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: { User: fakeUser },
  };
  return require("./authentication");
};

const buildReqResNext = (headers = {}) => ({
  req: { headers },
  res: {},
  next: vi.fn(),
});

const freshJwtHelper = () => {
  delete require.cache[require.resolve("../helper/jwt")];
  return require("../helper/jwt");
};

describe("middleware/authentication.js", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
    fakeUser.findOne.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("calls next() with no error and no loggedUser when there's no Authorization header", async () => {
    const verifyToken = loadVerifyToken();
    const { req, res, next } = buildReqResNext({});

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.loggedUser).toBeUndefined();
    expect(fakeUser.findOne).not.toHaveBeenCalled();
  });

  test("passes a SyntaxError to next() when the Authorization header is malformed", async () => {
    const verifyToken = loadVerifyToken();
    const { req, res, next } = buildReqResNext({ authorization: "Token" });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(SyntaxError));
  });

  test("attaches req.loggedUser and the token when the JWT is valid and the user exists", async () => {
    const { jwtSign } = freshJwtHelper();
    const token = await jwtSign({
      username: "jake",
      email: "jake@jake.jake",
    });
    const fakeFoundUser = { dataValues: {} };
    fakeUser.findOne.mockResolvedValue(fakeFoundUser);

    const verifyToken = loadVerifyToken();
    const { req, res, next } = buildReqResNext({
      authorization: `Token ${token}`,
    });

    await verifyToken(req, res, next);

    expect(req.loggedUser).toBe(fakeFoundUser);
    expect(req.loggedUser.dataValues.token).toBe(token);
    expect(req.headers.email).toBe("jake@jake.jake");
    expect(next).toHaveBeenCalledWith();
  });

  test("calls next() exactly once when the verified user no longer exists (missing-return regression check)", async () => {
    const { jwtSign } = freshJwtHelper();
    const token = await jwtSign({
      username: "ghost",
      email: "ghost@ghost.ghost",
    });
    fakeUser.findOne.mockResolvedValue(null);

    const verifyToken = loadVerifyToken();
    const { req, res, next } = buildReqResNext({
      authorization: `Token ${token}`,
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].name).toBe("NotFoundError");
  });

  test("passes the verify error to next() for an invalid token", async () => {
    const verifyToken = loadVerifyToken();
    const { req, res, next } = buildReqResNext({
      authorization: "Token not-a-real-token",
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(fakeUser.findOne).not.toHaveBeenCalled();
  });
});
