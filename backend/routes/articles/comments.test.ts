export {};

import express from "express";
import request from "supertest";

import testDbModule from "../../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  // authentication.ts and controllers/comments.ts are both .ts now, so
  // vi.resetModules() handles them as part of Vitest's own module graph.
  // helper/jwt.js is still plain CJS and holds a jwtVerify closure over
  // JWT_KEY, so it still needs manual eviction.
  delete require.cache[require.resolve("../../helper/jwt")];
  const router = (await import("./comments")).default;
  const errorHandler = require("../../middleware/errorHandler");

  const app = express();
  app.use(express.json());
  app.use("/articles", router);
  app.use(errorHandler);
  return app;
};

const createUser = async (db: any, overrides = {}) => {
  const user = await db.User.create({
    username: "jake",
    email: "jake@jake.jake",
    password: "hashed",
    ...overrides,
  });
  return user;
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

describe("routes/articles/comments.ts", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_KEY", "test-secret-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("GET /:slug/comments works without auth and returns comments", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    await db.Comment.create({
      body: "His name was my name too.",
      articleId: article.id,
      userId: author.id,
    });
    const app = await loadApp(db);

    const res = await request(app).get(`/articles/${article.slug}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(1);
  });

  test("GET /:slug/comments 404s for a missing article, formatted by errorHandler", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/articles/ghost/comments");

    expect(res.status).toBe(404);
    expect(res.body.errors.body[0]).toMatch(/Article not found/);
  });

  test("POST /:slug/comments requires auth", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);

    const res = await request(app)
      .post(`/articles/${article.slug}/comments`)
      .send({ comment: { body: "hi" } });

    expect(res.status).toBe(401);
  });

  test("POST /:slug/comments creates a comment when authenticated", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .post(`/articles/${article.slug}/comments`)
      .set("Authorization", `Token ${token}`)
      .send({ comment: { body: "His name was my name too." } });

    expect(res.status).toBe(201);
    expect(res.body.comment.body).toBe("His name was my name too.");

    const persisted = await db.Comment.findByPk(res.body.comment.id);
    expect(persisted.articleId).toBe(article.id);
  });

  test("DELETE /:slug/comments/:commentId deletes the comment when authorized", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const comment = await db.Comment.create({
      body: "hi",
      articleId: article.id,
      userId: author.id,
    });
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .delete(`/articles/${article.slug}/comments/${comment.id}`)
      .set("Authorization", `Token ${token}`);

    expect(res.status).toBe(200);
    const persisted = await db.Comment.findByPk(comment.id);
    expect(persisted).toBeNull();
  });
});
