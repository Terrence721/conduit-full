export {};

// The only genuine external dependency here is DB access via the User
// model - faked below via vi.doMock(), since it needs a live Postgres this
// environment doesn't have. jwtVerify/jwtSign are the real modules: real
// signing, real verification, no mocking, so the actual token-handling
// logic is exercised for real.
const fakeUser = { findOne: vi.fn() };

const loadVerifyToken = async () => {
  vi.doMock("../models", () => ({ default: { User: fakeUser } }));
  vi.resetModules();
  return (await import("./authentication")).default;
};

const buildReqResNext = (headers: any = {}) => ({
  req: { headers } as any,
  res: {} as any,
  next: vi.fn(),
});

const freshJwtHelper = () => {
  delete require.cache[require.resolve("../helper/jwt")];
  return require("../helper/jwt");
};

describe("middleware/authentication.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
    fakeUser.findOne.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("calls next() with no error and no loggedUser when there's no Authorization header", async () => {
    const verifyToken = await loadVerifyToken();
    const { req, res, next } = buildReqResNext({});

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.loggedUser).toBeUndefined();
    expect(fakeUser.findOne).not.toHaveBeenCalled();
  });

  test("passes a SyntaxError to next() when the Authorization header is malformed", async () => {
    const verifyToken = await loadVerifyToken();
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

    const verifyToken = await loadVerifyToken();
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

    const verifyToken = await loadVerifyToken();
    const { req, res, next } = buildReqResNext({
      authorization: `Token ${token}`,
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].name).toBe("NotFoundError");
  });

  test("passes the verify error to next() for an invalid token", async () => {
    const verifyToken = await loadVerifyToken();
    const { req, res, next } = buildReqResNext({
      authorization: "Token not-a-real-token",
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(fakeUser.findOne).not.toHaveBeenCalled();
  });
});
