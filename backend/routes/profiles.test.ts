export {};

import request from "supertest";

import testDbModule from "../testUtils/testDb";
import installFreshTestDb from "../testUtils/installFreshTestDb";
import buildTestApp from "../testUtils/buildTestApp";
import createUser from "../testUtils/createUser";
import tokenFor from "../testUtils/tokenFor";
const { buildTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installFreshTestDb(db);
  const router = (await import("./profiles")).default;
  const errorHandler = (await import("../middleware/errorHandler")).default;

  return buildTestApp(router, errorHandler, "/profiles");
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
