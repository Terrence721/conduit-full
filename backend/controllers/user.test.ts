export {};

import testDbModule from "../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;
const { bcryptCompare } = require("../helper/bcrypt");

const loadUserController = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  return import("./user");
};

const buildRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createUser = async (db: any, overrides = {}) => {
  const user = await db.User.create({
    username: "jake",
    email: "jake@jake.jake",
    password: "hashed",
    ...overrides,
  });
  user.dataValues.token = "fake-token";
  return user;
};

describe("controllers/user.ts", () => {
  describe("currentUser", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { currentUser } = await loadUserController(db);
      const req: any = { loggedUser: undefined, headers: {} };
      const res = buildRes();
      const next = vi.fn();

      await currentUser(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("attaches email from req.headers.email and clears the header", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { currentUser } = await loadUserController(db);
      const req: any = {
        loggedUser,
        headers: { email: "jake@jake.jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await currentUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ user }] = res.json.mock.calls[0];
      expect(user.dataValues.email).toBe("jake@jake.jake");
      expect(req.headers.email).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { updateUser } = await loadUserController(db);
      const req: any = {
        loggedUser: undefined,
        body: { user: {} },
        headers: {},
      };
      const res = buildRes();
      const next = vi.fn();

      await updateUser(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("updates a field without a password in the payload, without crashing", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { updateUser } = await loadUserController(db);
      const req: any = {
        loggedUser,
        body: { user: { bio: "I write code" } },
        headers: { email: "jake@jake.jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ user }] = res.json.mock.calls[0];
      expect(user.bio).toBe("I write code");

      const persisted = await db.User.findOne({ where: { username: "jake" } });
      expect(persisted.bio).toBe("I write code");
    });

    test("includes email in the response even when email isn't part of the update", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { updateUser } = await loadUserController(db);
      const req: any = {
        loggedUser,
        body: { user: { bio: "no email here" } },
        headers: { email: "jake@jake.jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateUser(req, res, next);

      const [{ user }] = res.json.mock.calls[0];
      expect(user.dataValues.email).toBe("jake@jake.jake");
    });

    test("updates the email directly when it's part of the update", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { updateUser } = await loadUserController(db);
      const req: any = {
        loggedUser,
        body: { user: { email: "new@jake.jake" } },
        headers: { email: "jake@jake.jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateUser(req, res, next);

      const [{ user }] = res.json.mock.calls[0];
      expect(user.dataValues.email).toBe("new@jake.jake");

      const persisted = await db.User.findOne({ where: { username: "jake" } });
      expect(persisted.email).toBe("new@jake.jake");
    });

    test("hashes and persists a new password when one is provided", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { updateUser } = await loadUserController(db);
      const req: any = {
        loggedUser,
        body: { user: { password: "newpassword123" } },
        headers: { email: "jake@jake.jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const persisted = await db.User.findOne({ where: { username: "jake" } });
      expect(await bcryptCompare("newpassword123", persisted.password)).toBe(
        true,
      );
    });

    test("ignores non-whitelisted fields like id (mass-assignment hardening)", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const originalId = loggedUser.id;
      const { updateUser } = await loadUserController(db);
      const req: any = {
        loggedUser,
        body: { user: { id: 999, createdAt: "2000-01-01", bio: "safe" } },
        headers: { email: "jake@jake.jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateUser(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const persisted = await db.User.findOne({ where: { username: "jake" } });
      expect(persisted.id).toBe(originalId);
      expect(persisted.bio).toBe("safe");
    });
  });
});
