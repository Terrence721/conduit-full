export {};

const { buildTestDb, installTestDb } = require("../testUtils/testDb");

const loadUsersController = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  return import("./users");
};

const freshJwtHelper = () => {
  delete require.cache[require.resolve("../helper/jwt")];
  return require("../helper/jwt");
};

const buildRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("controllers/users.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("signUp", () => {
    test("throws FieldRequiredError when username is missing", async () => {
      const db = await buildTestDb();
      const { signUp } = await loadUsersController(db);
      const req: any = {
        body: { user: { email: "jake@jake.jake", password: "pw" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await signUp(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("FieldRequiredError");
    });

    test("throws AlreadyTakenError when the email already exists", async () => {
      const db = await buildTestDb();
      await db.User.create({
        username: "jake",
        email: "jake@jake.jake",
        password: "hashed",
      });
      const { signUp } = await loadUsersController(db);
      const req: any = {
        body: {
          user: {
            username: "jane",
            email: "jake@jake.jake",
            password: "pw",
          },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await signUp(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("AlreadyTakenError");
    });

    test("throws AlreadyTakenError when the username already exists", async () => {
      const db = await buildTestDb();
      await db.User.create({
        username: "jake",
        email: "jake@jake.jake",
        password: "hashed",
      });
      const { signUp } = await loadUsersController(db);
      const req: any = {
        body: {
          user: {
            username: "jake",
            email: "new@jake.jake",
            password: "pw",
          },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await signUp(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("AlreadyTakenError");
    });

    test("creates the user and issues a token with the real username and email", async () => {
      const db = await buildTestDb();
      const { signUp } = await loadUsersController(db);
      const req: any = {
        body: {
          user: { username: "jake", email: "jake@jake.jake", password: "pw" },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await signUp(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const [{ user }] = res.json.mock.calls[0];
      expect(user.username).toBe("jake");

      const { jwtVerify } = freshJwtHelper();
      const decoded = await jwtVerify(user.dataValues.token);
      expect(decoded.username).toBe("jake");
      expect(decoded.email).toBe("jake@jake.jake");
    });
  });

  describe("signIn", () => {
    const createUser = async (db: any) => {
      const { bcryptHash } = require("../helper/bcrypt");
      return db.User.create({
        username: "jake",
        email: "jake@jake.jake",
        password: await bcryptHash("plakinha"),
      });
    };

    test("throws NotFoundError when the email doesn't exist", async () => {
      const db = await buildTestDb();
      const { signIn } = await loadUsersController(db);
      const req: any = {
        body: { user: { email: "ghost@ghost.ghost", password: "x" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await signIn(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("throws ValidationError when the password is wrong", async () => {
      const db = await buildTestDb();
      await createUser(db);
      const { signIn } = await loadUsersController(db);
      const req: any = {
        body: { user: { email: "jake@jake.jake", password: "wrong" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await signIn(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("ValidationError");
    });

    test("issues a token with the real username, not undefined", async () => {
      const db = await buildTestDb();
      await createUser(db);
      const { signIn } = await loadUsersController(db);
      const req: any = {
        body: { user: { email: "jake@jake.jake", password: "plakinha" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await signIn(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ user }] = res.json.mock.calls[0];

      const { jwtVerify } = freshJwtHelper();
      const decoded = await jwtVerify(user.dataValues.token);
      expect(decoded.username).toBe("jake");
      expect(decoded.email).toBe("jake@jake.jake");
    });
  });
});
