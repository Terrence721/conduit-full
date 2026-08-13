export {};

import request from "supertest";

const { buildTestDb, installTestDb } = require("./testUtils/testDb");

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  delete require.cache[require.resolve("./middleware/authentication")];
  delete require.cache[require.resolve("./helper/jwt")];
  delete require.cache[require.resolve("./controllers/articles")];
  delete require.cache[require.resolve("./controllers/comments")];
  delete require.cache[require.resolve("./controllers/favorites")];
  return (await import("./index")).default;
};

describe("index.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("GET / reports API status outside production", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.status).toMatch(/API is running/);
  });

  test("unmatched GET path 404s with the app's own JSON shape", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/nope");

    expect(res.status).toBe(404);
    expect(res.body.errors.body[0]).toBe("Not found");
  });

  test("unmatched POST path also 404s with the app's own JSON shape (not Express's default HTML 404)", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).post("/nope").send({});

    expect(res.status).toBe(404);
    expect(res.body.errors.body[0]).toBe("Not found");
  });

  test("full user journey: register, login, create an article, see it in the feed", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const signUpRes = await request(app)
      .post("/api/users")
      .send({
        user: { username: "jake", email: "jake@jake.jake", password: "pw" },
      });
    expect(signUpRes.status).toBe(201);
    const registerToken = signUpRes.body.user.token;

    const loginRes = await request(app)
      .post("/api/users/login")
      .send({ user: { email: "jake@jake.jake", password: "pw" } });
    expect(loginRes.status).toBe(200);
    const loginToken = loginRes.body.user.token;
    expect(loginToken).toBeTruthy();
    expect(registerToken).toBeTruthy();

    const meRes = await request(app)
      .get("/api/user")
      .set("Authorization", `Token ${loginToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.username).toBe("jake");

    const createRes = await request(app)
      .post("/api/articles")
      .set("Authorization", `Token ${loginToken}`)
      .send({
        user: undefined,
        article: { title: "Dragons", description: "d", body: "b" },
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.article.slug).toBe("dragons");

    const allArticlesRes = await request(app).get("/api/articles");
    expect(allArticlesRes.status).toBe(200);
    expect(allArticlesRes.body.articles).toHaveLength(1);
    expect(allArticlesRes.body.articles[0].slug).toBe("dragons");

    const tagsRes = await request(app).get("/api/tags");
    expect(tagsRes.status).toBe(200);
    expect(tagsRes.body.tags).toEqual([]);
  });
});
