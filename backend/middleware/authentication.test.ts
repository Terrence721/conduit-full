export {};

import testDbModule from "../testUtils/testDb";
import installFreshTestDb from "../testUtils/installFreshTestDb";
import createUser from "../testUtils/createUser";
import tokenFor from "../testUtils/tokenFor";
const { buildTestDb } = testDbModule;

const loadAuthentication = async (db: any) => {
  installFreshTestDb(db);
  return (await import("./authentication")).default;
};

const loadVerifyToken = async (db: any) => {
  const { verifyToken } = await loadAuthentication(db);
  return verifyToken;
};

const buildReqResNext = (headers: any = {}) => ({
  req: { headers } as any,
  res: {} as any,
  next: vi.fn(),
});

describe("middleware/authentication.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("calls next() with no error and no loggedUser when there's no Authorization header", async () => {
    const db = await buildTestDb();
    const findOneSpy = vi.spyOn(db.User, "findOne");
    const verifyToken = await loadVerifyToken(db);
    const { req, res, next } = buildReqResNext({});

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.loggedUser).toBeUndefined();
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  test("passes a SyntaxError to next() when the Authorization header is malformed", async () => {
    const db = await buildTestDb();
    const verifyToken = await loadVerifyToken(db);
    const { req, res, next } = buildReqResNext({ authorization: "Token" });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(SyntaxError));
  });

  test("attaches req.loggedUser and the token when the JWT is valid and the user exists", async () => {
    const db = await buildTestDb();
    await createUser(db, { username: "jake", email: "jake@jake.jake" });
    const token = await tokenFor({
      username: "jake",
      email: "jake@jake.jake",
    });

    const verifyToken = await loadVerifyToken(db);
    const { req, res, next } = buildReqResNext({
      authorization: `Token ${token}`,
    });

    await verifyToken(req, res, next);

    expect(req.loggedUser.dataValues.email).toBe("jake@jake.jake");
    expect(req.loggedUser.dataValues.token).toBe(token);
    expect(next).toHaveBeenCalledWith();
  });

  test("calls next() exactly once when the verified user no longer exists (missing-return regression check)", async () => {
    const db = await buildTestDb();
    const token = await tokenFor({
      username: "ghost",
      email: "ghost@ghost.ghost",
    });

    const verifyToken = await loadVerifyToken(db);
    const { req, res, next } = buildReqResNext({
      authorization: `Token ${token}`,
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].name).toBe("NotFoundError");
  });

  test("passes the verify error to next() for an invalid token", async () => {
    const db = await buildTestDb();
    const findOneSpy = vi.spyOn(db.User, "findOne");
    const verifyToken = await loadVerifyToken(db);
    const { req, res, next } = buildReqResNext({
      authorization: "Token not-a-real-token",
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  describe("requireAuth", () => {
    test("passes UnauthorizedError to next() when there's no loggedUser", async () => {
      const db = await buildTestDb();
      const { requireAuth } = await loadAuthentication(db);
      const { req, res, next } = buildReqResNext();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("calls next() with no error when a loggedUser is present", async () => {
      const db = await buildTestDb();
      const { requireAuth } = await loadAuthentication(db);
      const { req, res, next } = buildReqResNext();
      req.loggedUser = { id: 1 };

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
