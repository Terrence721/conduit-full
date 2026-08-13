export {};

import express from "express";
import request from "supertest";
import bcryptHelper from "../helper/bcrypt";

import testDbModule from "../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;
const { bcryptHash } = bcryptHelper;

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  const router = (await import("./users")).default;
  const errorHandler = (await import("../middleware/errorHandler")).default;

  const app = express();
  app.use(express.json());
  app.use("/users", router);
  app.use(errorHandler);
  return app;
};

describe("routes/users.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("POST / registers a new user", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app)
      .post("/users")
      .send({
        user: { username: "jake", email: "jake@jake.jake", password: "pw" },
      });

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe("jake");
    expect(res.body.user.token).toBeTruthy();
  });

  test("POST / 422s when a required field is missing", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app)
      .post("/users")
      .send({ user: { email: "jake@jake.jake", password: "pw" } });

    expect(res.status).toBe(422);
  });

  test("POST /login signs in an existing user with a real token", async () => {
    const db = await buildTestDb();
    await db.User.create({
      username: "jake",
      email: "jake@jake.jake",
      password: await bcryptHash("plakinha"),
    });
    const app = await loadApp(db);

    const res = await request(app)
      .post("/users/login")
      .send({ user: { email: "jake@jake.jake", password: "plakinha" } });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("jake");

    const { jwtVerify } = (await import("../helper/jwt")).default;
    const decoded: any = await jwtVerify(res.body.user.token);
    expect(decoded.username).toBe("jake");
  });

  test("POST /login 404s for an unknown email", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app)
      .post("/users/login")
      .send({ user: { email: "ghost@ghost.ghost", password: "x" } });

    expect(res.status).toBe(404);
  });
});
