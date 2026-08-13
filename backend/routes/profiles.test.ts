export {};

import express from "express";
import request from "supertest";

import testDbModule from "../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  const router = (await import("./profiles")).default;
  const errorHandler = (await import("../middleware/errorHandler")).default;

  const app = express();
  app.use(express.json());
  app.use("/profiles", router);
  app.use(errorHandler);
  return app;
};

const createUser = async (db: any, overrides = {}) => {
  return db.User.create({
    username: "jake",
    email: "jake@jake.jake",
    password: "hashed",
    ...overrides,
  });
};

const tokenFor = async (user: any) => {
  const { jwtSign } = (await import("../helper/jwt")).default;
  return jwtSign(user);
};

describe("routes/profiles.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("GET /:username works without auth", async () => {
    const db = await buildTestDb();
    await createUser(db);
    const app = await loadApp(db);

    const res = await request(app).get("/profiles/jake");

    expect(res.status).toBe(200);
    expect(res.body.profile.username).toBe("jake");
  });

  test("GET /:username 404s for a missing user", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/profiles/ghost");

    expect(res.status).toBe(404);
  });

  test("POST /:username/follow requires auth", async () => {
    const db = await buildTestDb();
    await createUser(db);
    const app = await loadApp(db);

    const res = await request(app).post("/profiles/jake/follow");

    expect(res.status).toBe(401);
  });

  test("POST /:username/follow follows and persists it", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const fan = await createUser(db, {
      username: "jane",
      email: "jane@jane.jane",
    });
    const app = await loadApp(db);
    const token = await tokenFor(fan);

    const res = await request(app)
      .post(`/profiles/${author.username}/follow`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.profile.following).toBe(true);

    const persisted = await db.User.findOne({
      where: { username: author.username },
    });
    expect(await persisted.hasFollower(fan)).toBe(true);
  });

  test("DELETE /:username/follow unfollows and persists it", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const fan = await createUser(db, {
      username: "jane",
      email: "jane@jane.jane",
    });
    await author.addFollower(fan);
    const app = await loadApp(db);
    const token = await tokenFor(fan);

    const res = await request(app)
      .delete(`/profiles/${author.username}/follow`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.profile.following).toBe(false);

    const persisted = await db.User.findOne({
      where: { username: author.username },
    });
    expect(await persisted.hasFollower(fan)).toBe(false);
  });
});
