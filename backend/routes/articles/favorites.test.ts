export {};

import express from "express";
import request from "supertest";

const { buildTestDb, installTestDb } = require("../../testUtils/testDb");

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  delete require.cache[require.resolve("../../middleware/authentication")];
  delete require.cache[require.resolve("../../helper/jwt")];
  delete require.cache[require.resolve("../../controllers/favorites")];
  const router = (await import("./favorites")).default;
  const errorHandler = require("../../middleware/errorHandler");

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

const createArticle = async (db: any, author: any) => {
  const article = await db.Article.create({
    slug: "how-to-train-your-dragon",
    title: "How to train your dragon",
    description: "d",
    body: "b",
  });
  await article.setAuthor(author);
  return article;
};

const tokenFor = async (user: any) => {
  const { jwtSign } = require("../../helper/jwt");
  return jwtSign(user);
};

describe("routes/articles/favorites.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("POST /:slug/favorite requires auth", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);

    const res = await request(app).post(`/articles/${article.slug}/favorite`);

    expect(res.status).toBe(401);
  });

  test("POST /:slug/favorite 404s for a missing article", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .post("/articles/ghost/favorite")
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(404);
  });

  test("POST /:slug/favorite favorites the article and persists it", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const fan = await createUser(db, {
      username: "jane",
      email: "jane@jane.jane",
    });
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(fan);

    const res = await request(app)
      .post(`/articles/${article.slug}/favorite`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.article.favorited).toBe(true);
    expect(res.body.article.favoritesCount).toBe(1);

    const persisted = await db.Article.findOne({
      where: { slug: article.slug },
    });
    expect(await persisted.hasUser(fan)).toBe(true);
  });

  test("DELETE /:slug/favorite unfavorites the article and persists it", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const fan = await createUser(db, {
      username: "jane",
      email: "jane@jane.jane",
    });
    const article = await createArticle(db, author);
    await fan.addFavorite(article);
    const app = await loadApp(db);
    const token = await tokenFor(fan);

    const res = await request(app)
      .delete(`/articles/${article.slug}/favorite`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.article.favorited).toBe(false);
    expect(res.body.article.favoritesCount).toBe(0);

    const persisted = await db.Article.findOne({
      where: { slug: article.slug },
    });
    expect(await persisted.hasUser(fan)).toBe(false);
  });
});
