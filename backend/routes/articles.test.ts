export {};

import express from "express";
import request from "supertest";

const { buildTestDb, installTestDb } = require("../testUtils/testDb");

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  // articles.ts pulls in ./articles/favorites and ./articles/comments as
  // sub-routers, each with their own plain-CJS require()s (authentication,
  // jwt, and their own controllers) that vi.resetModules() doesn't touch -
  // all need evicting so every route in this test shares the same fake db.
  delete require.cache[require.resolve("../middleware/authentication")];
  delete require.cache[require.resolve("../helper/jwt")];
  delete require.cache[require.resolve("../controllers/articles")];
  delete require.cache[require.resolve("../controllers/favorites")];
  delete require.cache[require.resolve("../controllers/comments")];
  const router = (await import("./articles")).default;
  const errorHandler = require("../middleware/errorHandler");

  const app = express();
  app.use(express.json());
  app.use("/articles", router);
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

const createArticle = async (db: any, author: any, overrides = {}) => {
  const article = await db.Article.create({
    slug: "how-to-train-your-dragon",
    title: "How to train your dragon",
    description: "d",
    body: "b",
    ...overrides,
  });
  await article.setAuthor(author);
  return article;
};

const tokenFor = async (user: any) => {
  const { jwtSign } = require("../helper/jwt");
  return jwtSign(user);
};

describe("routes/articles.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("GET / works without auth", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/articles");

    expect(res.status).toBe(200);
    expect(res.body.articles).toEqual([]);
  });

  test("GET /feed requires auth and isn't shadowed by /:slug", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/articles/feed");

    // A slug-shadowing bug would route this through singleArticle instead,
    // which 404s with "Article not found" rather than requiring auth.
    expect(res.status).toBe(401);
  });

  test("GET /:slug returns a single article", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);

    const res = await request(app).get(`/articles/${article.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.article.slug).toBe(article.slug);
  });

  test("POST / requires auth", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app)
      .post("/articles")
      .send({ article: { title: "T", description: "d", body: "b" } });

    expect(res.status).toBe(401);
  });

  test("POST / creates an article when authenticated", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Token ${token}`)
      .send({ article: { title: "Dragons", description: "d", body: "b" } });

    expect(res.status).toBe(201);
    expect(res.body.article.slug).toBe("dragons");
  });

  test("PUT /:slug requires the logged-in user to be the author", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const other = await createUser(db, {
      username: "mallory",
      email: "m@m.m",
    });
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(other);

    const res = await request(app)
      .put(`/articles/${article.slug}`)
      .set("Authorization", `Token ${token}`)
      .send({ article: { title: "Hacked" } });

    expect(res.status).toBe(403);
  });

  test("DELETE /:slug deletes when the logged-in user is the author", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .delete(`/articles/${article.slug}`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    const persisted = await db.Article.findOne({
      where: { slug: article.slug },
    });
    expect(persisted).toBeNull();
  });

  test("mounts the favorites sub-router at the same base path", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .post(`/articles/${article.slug}/favorite`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.article.favorited).toBe(true);
  });

  test("mounts the comments sub-router at the same base path", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .post(`/articles/${article.slug}/comments`)
      .set("Authorization", `Token ${token}`)
      .send({ comment: { body: "hi" } });

    expect(res.status).toBe(201);
    expect(res.body.comment.body).toBe("hi");
  });
});
