export {};

import express from "express";
import request from "supertest";

const { buildTestDb, installTestDb } = require("../testUtils/testDb");

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  delete require.cache[require.resolve("../middleware/authentication")];
  delete require.cache[require.resolve("../helper/jwt")];
  const router = (await import("./user")).default;
  const errorHandler = require("../middleware/errorHandler");

  const app = express();
  app.use(express.json());
  app.use("/user", router);
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
  const { jwtSign } = require("../helper/jwt");
  return jwtSign(user);
};

describe("routes/user.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("GET / requires auth", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/user");

    expect(res.status).toBe(401);
  });

  test("GET / returns the current user", async () => {
    const db = await buildTestDb();
    const user = await createUser(db);
    const app = await loadApp(db);
    const token = await tokenFor(user);

    const res = await request(app)
      .get("/user")
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("jake");
    expect(res.body.user.email).toBe("jake@jake.jake");
  });

  test("PUT / requires auth", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app)
      .put("/user")
      .send({ user: { bio: "hi" } });

    expect(res.status).toBe(401);
  });

  test("PUT / updates the current user without a password in the payload", async () => {
    const db = await buildTestDb();
    const user = await createUser(db);
    const app = await loadApp(db);
    const token = await tokenFor(user);

    const res = await request(app)
      .put("/user")
      .set("Authorization", `Token ${token}`)
      .send({ user: { bio: "I write code" } });

    expect(res.status).toBe(200);
    expect(res.body.user.bio).toBe("I write code");
  });
});
