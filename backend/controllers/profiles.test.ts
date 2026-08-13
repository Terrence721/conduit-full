export {};

import testDbModule from "../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;

const loadProfilesController = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  return import("./profiles");
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

describe("controllers/profiles.ts", () => {
  describe("getProfile", () => {
    test("throws NotFoundError when the username doesn't exist", async () => {
      const db = await buildTestDb();
      const { getProfile } = await loadProfilesController(db);
      const req: any = { loggedUser: undefined, params: { username: "ghost" } };
      const res = buildRes();
      const next = vi.fn();

      await getProfile(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("returns the profile without the email field", async () => {
      const db = await buildTestDb();
      await createUser(db);
      const { getProfile } = await loadProfilesController(db);
      const req: any = { loggedUser: undefined, params: { username: "jake" } };
      const res = buildRes();
      const next = vi.fn();

      await getProfile(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ profile }] = res.json.mock.calls[0];
      expect(profile.username).toBe("jake");
      expect(JSON.parse(JSON.stringify(profile))).not.toHaveProperty("email");
    });

    test("works with no logged-in user and reports following: false", async () => {
      const db = await buildTestDb();
      await createUser(db);
      const { getProfile } = await loadProfilesController(db);
      const req: any = { loggedUser: undefined, params: { username: "jake" } };
      const res = buildRes();
      const next = vi.fn();

      await getProfile(req, res, next);

      const [{ profile }] = res.json.mock.calls[0];
      expect(profile.dataValues.following).toBe(false);
    });
  });

  describe("followToggler", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { followToggler } = await loadProfilesController(db);
      const req: any = {
        method: "POST",
        loggedUser: undefined,
        params: { username: "jake" },
      };
      const res = buildRes();
      const next = vi.fn();

      await followToggler(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("throws NotFoundError when the username doesn't exist", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { followToggler } = await loadProfilesController(db);
      const req: any = {
        method: "POST",
        loggedUser,
        params: { username: "ghost" },
      };
      const res = buildRes();
      const next = vi.fn();

      await followToggler(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("POST follows the profile and persists it", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const fan = await createUser(db, {
        username: "jane",
        email: "jane@jane.jane",
      });

      const { followToggler } = await loadProfilesController(db);
      const req: any = {
        method: "POST",
        loggedUser: fan,
        params: { username: author.username },
      };
      const res = buildRes();
      const next = vi.fn();

      await followToggler(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ profile }] = res.json.mock.calls[0];
      expect(profile.dataValues.following).toBe(true);
      expect(profile.dataValues.followersCount).toBe(1);

      const persisted = await db.User.findOne({
        where: { username: author.username },
      });
      expect(await persisted.hasFollower(fan)).toBe(true);
    });

    test("DELETE unfollows the profile and persists it", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const fan = await createUser(db, {
        username: "jane",
        email: "jane@jane.jane",
      });
      await author.addFollower(fan);

      const { followToggler } = await loadProfilesController(db);
      const req: any = {
        method: "DELETE",
        loggedUser: fan,
        params: { username: author.username },
      };
      const res = buildRes();
      const next = vi.fn();

      await followToggler(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ profile }] = res.json.mock.calls[0];
      expect(profile.dataValues.following).toBe(false);
      expect(profile.dataValues.followersCount).toBe(0);

      const persisted = await db.User.findOne({
        where: { username: author.username },
      });
      expect(await persisted.hasFollower(fan)).toBe(false);
    });
  });
});
