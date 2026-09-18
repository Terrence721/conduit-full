export {};

import request from "supertest";

import testDbModule from "../../testUtils/testDb";
import installFreshTestDb from "../../testUtils/installFreshTestDb";
import buildTestApp from "../../testUtils/buildTestApp";
import createUser from "../../testUtils/createUser";
import createArticle from "../../testUtils/createArticle";
import tokenFor from "../../testUtils/tokenFor";
const { buildTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installFreshTestDb(db);
  const router = (await import("./comments")).default;
  const errorHandler = (await import("../../middleware/errorHandler")).default;

  return buildTestApp(router, errorHandler, "/articles");
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
