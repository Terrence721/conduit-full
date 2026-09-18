export {};

import request from "supertest";

import testDbModule from "../testUtils/testDb";
import installFreshTestDb from "../testUtils/installFreshTestDb";
import buildTestApp from "../testUtils/buildTestApp";
import createUser from "../testUtils/createUser";
const { buildTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installFreshTestDb(db);
  const router = (await import("./user")).default;
  const errorHandler = (await import("../middleware/errorHandler")).default;

  return buildTestApp(router, errorHandler, "/user");
};

const tokenFor = async (user: any) => {
  const { jwtSign } = (await import("../helper/jwt")).default;
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
