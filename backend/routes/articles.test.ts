export {};

import request from "supertest";

import testDbModule from "../testUtils/testDb";
import installFreshTestDb from "../testUtils/installFreshTestDb";
import buildTestApp from "../testUtils/buildTestApp";
import createUser from "../testUtils/createUser";
import createArticle from "../testUtils/createArticle";
import tokenFor from "../testUtils/tokenFor";
const { buildTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installFreshTestDb(db);
  const router = (await import("./articles")).default;
  const errorHandler = (await import("../middleware/errorHandler")).default;

  return buildTestApp(router, errorHandler, "/articles");
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

  test("POST / 422s when the article payload is missing", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Token ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });

  test("POST / 422s when required article fields are missing or invalid", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    for (const article of [
      { description: "d", body: "b" },
      { title: "T", body: "b" },
      { title: "T", description: "d" },
      { title: "T", description: "d", body: "b", tagList: 5 },
    ]) {
      const res = await request(app)
        .post("/articles")
        .set("Authorization", `Token ${token}`)
        .send({ article });

      expect(res.status).toBe(422);
    }
  });

  test("PUT /:slug 422s when the article payload is missing", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const res = await request(app)
      .put(`/articles/${article.slug}`)
      .set("Authorization", `Token ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });

  test("PUT /:slug 422s on invalid field updates", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const article = await createArticle(db, author);
    const app = await loadApp(db);
    const token = await tokenFor(author);

    const slug = article.slug;
    for (const updates of [{ title: "" }, { description: "" }, { body: "" }]) {
      const res = await request(app)
        .put(`/articles/${slug}`)
        .set("Authorization", `Token ${token}`)
        .send({ article: updates });

      expect(res.status).toBe(422);
    }
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
