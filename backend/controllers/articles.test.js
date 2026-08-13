const { buildTestDb, installTestDb } = require("../testUtils/testDb");

const loadArticlesController = (db) => {
  installTestDb(db);
  delete require.cache[require.resolve("./articles")];
  return require("./articles");
};

const buildRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createUser = async (db, overrides = {}) => {
  const user = await db.User.create({
    username: "jake",
    email: "jake@jake.jake",
    password: "hashed",
    ...overrides,
  });
  user.dataValues.token = "fake-token";
  return user;
};

describe("controllers/articles.js", () => {
  describe("allArticles", () => {
    test("returns an empty list when there are no articles", async () => {
      const db = await buildTestDb();
      const { allArticles } = loadArticlesController(db);
      const req = { query: {}, loggedUser: undefined };
      const res = buildRes();
      const next = vi.fn();

      await allArticles(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        articles: [],
        articlesCount: 0,
      });
    });

    test("returns articles with tagList/favorited/author appended", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const article = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);
      const tag = await db.Tag.create({ name: "dragons" });
      await article.addTagList(tag);

      const { allArticles } = loadArticlesController(db);
      const req = { query: {}, loggedUser: undefined };
      const res = buildRes();
      const next = vi.fn();

      await allArticles(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ articles, articlesCount }] = res.json.mock.calls[0];
      expect(articlesCount).toBe(1);
      expect(articles[0].dataValues.tagList).toEqual(["dragons"]);
      expect(articles[0].dataValues.favorited).toBe(false);
      expect(articles[0].dataValues.favoritesCount).toBe(0);
    });

    test("filters by tag", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const match = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await match.setAuthor(author);
      await match.addTagList(await db.Tag.create({ name: "dragons" }));

      const noMatch = await db.Article.create({
        slug: "b",
        title: "B",
        description: "d",
        body: "b",
      });
      await noMatch.setAuthor(author);
      await noMatch.addTagList(await db.Tag.create({ name: "cats" }));

      const { allArticles } = loadArticlesController(db);
      const req = { query: { tag: "dragons" }, loggedUser: undefined };
      const res = buildRes();
      const next = vi.fn();

      await allArticles(req, res, next);

      const [{ articles, articlesCount }] = res.json.mock.calls[0];
      expect(articlesCount).toBe(1);
      expect(articles[0].slug).toBe("a");
    });

    test("filters by author", async () => {
      const db = await buildTestDb();
      const jake = await createUser(db, {
        username: "jake",
        email: "jake@jake.jake",
      });
      const jane = await createUser(db, {
        username: "jane",
        email: "jane@jane.jane",
      });

      const jakeArticle = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await jakeArticle.setAuthor(jake);
      const janeArticle = await db.Article.create({
        slug: "b",
        title: "B",
        description: "d",
        body: "b",
      });
      await janeArticle.setAuthor(jane);

      const { allArticles } = loadArticlesController(db);
      const req = { query: { author: "jake" }, loggedUser: undefined };
      const res = buildRes();
      const next = vi.fn();

      await allArticles(req, res, next);

      const [{ articles, articlesCount }] = res.json.mock.calls[0];
      expect(articlesCount).toBe(1);
      expect(articles[0].slug).toBe("a");
    });

    test("returns a user's favorited articles when favorited is given", async () => {
      const db = await buildTestDb();
      const author = await createUser(db, {
        username: "jake",
        email: "jake@jake.jake",
      });
      const fan = await createUser(db, {
        username: "jane",
        email: "jane@jane.jane",
      });
      const article = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);
      await fan.addFavorite(article);

      const { allArticles } = loadArticlesController(db);
      const req = { query: { favorited: "jane" }, loggedUser: undefined };
      const res = buildRes();
      const next = vi.fn();

      await allArticles(req, res, next);

      const [{ articles, articlesCount }] = res.json.mock.calls[0];
      expect(articlesCount).toBe(1);
      expect(articles[0].slug).toBe("a");
    });

    test("throws NotFoundError when favorited names a user that doesn't exist (regression check)", async () => {
      const db = await buildTestDb();
      const { allArticles } = loadArticlesController(db);
      const req = { query: { favorited: "ghost" }, loggedUser: undefined };
      const res = buildRes();
      const next = vi.fn();

      await allArticles(req, res, next);

      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });
  });

  describe("createArticle", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { createArticle } = loadArticlesController(db);
      const req = { loggedUser: undefined, body: { article: {} } };
      const res = buildRes();
      const next = vi.fn();

      await createArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test.each(["title", "description", "body"])(
      "throws FieldRequiredError when %s is missing",
      async (missingField) => {
        const db = await buildTestDb();
        const loggedUser = await createUser(db);
        const { createArticle } = loadArticlesController(db);
        const article = { title: "T", description: "D", body: "B" };
        delete article[missingField];
        const req = { loggedUser, body: { article } };
        const res = buildRes();
        const next = vi.fn();

        await createArticle(req, res, next);

        expect(next.mock.calls[0][0].name).toBe("FieldRequiredError");
      },
    );

    test("creates an article without a tagList in the request body (regression check)", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { createArticle } = loadArticlesController(db);
      const req = {
        loggedUser,
        body: {
          article: {
            title: "How to train your dragon",
            description: "d",
            body: "b",
          },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await createArticle(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("attaches existing and new tags; silently skips a too-short unknown tag", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      await db.Tag.create({ name: "dragons" });
      const { createArticle } = loadArticlesController(db);
      const req = {
        loggedUser,
        body: {
          article: {
            title: "How to train your dragon",
            description: "d",
            body: "b",
            tagList: ["dragons", "training", "ok"],
          },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await createArticle(req, res, next);

      const [{ article }] = res.json.mock.calls[0];
      const persisted = await db.Article.findOne({
        where: { slug: article.slug },
      });
      const tags = await persisted.getTagList();
      expect(tags.map((t) => t.name).sort()).toEqual(["dragons", "training"]);
    });

    test("throws AlreadyTakenError when the slug is already used", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      await db.Article.create({
        slug: "how-to-train-your-dragon",
        title: "x",
        description: "d",
        body: "b",
      });
      const { createArticle } = loadArticlesController(db);
      const req = {
        loggedUser,
        body: {
          article: {
            title: "How to train your dragon",
            description: "d",
            body: "b",
          },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await createArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("AlreadyTakenError");
    });

    test("awaits setAuthor before responding (regression check for a missing-await bug)", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { createArticle } = loadArticlesController(db);

      let setAuthorSettled = false;
      const originalSetAuthor = db.Article.prototype.setAuthor;
      vi.spyOn(db.Article.prototype, "setAuthor").mockImplementation(
        async function (...args) {
          const result = await originalSetAuthor.apply(this, args);
          await new Promise((resolve) => setTimeout(resolve, 10));
          setAuthorSettled = true;
          return result;
        },
      );

      const req = {
        loggedUser,
        body: {
          article: {
            title: "How to train your dragon",
            description: "d",
            body: "b",
          },
        },
      };
      const res = buildRes();
      const next = vi.fn();

      await createArticle(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(setAuthorSettled).toBe(true);

      const persisted = await db.Article.findOne({
        where: { slug: "how-to-train-your-dragon" },
      });
      expect(persisted.userId).toBe(loggedUser.id);
    });
  });

  describe("articlesFeed", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { articlesFeed } = loadArticlesController(db);
      const req = { loggedUser: undefined, query: {} };
      const res = buildRes();
      const next = vi.fn();

      await articlesFeed(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("only returns articles from followed authors", async () => {
      const db = await buildTestDb();
      const me = await createUser(db, { username: "me", email: "me@me.me" });
      const followed = await createUser(db, {
        username: "followed",
        email: "f@f.f",
      });
      const stranger = await createUser(db, {
        username: "stranger",
        email: "s@s.s",
      });
      await me.addFollowing(followed);

      const followedArticle = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await followedArticle.setAuthor(followed);
      const strangerArticle = await db.Article.create({
        slug: "b",
        title: "B",
        description: "d",
        body: "b",
      });
      await strangerArticle.setAuthor(stranger);

      const { articlesFeed } = loadArticlesController(db);
      const req = { loggedUser: me, query: {} };
      const res = buildRes();
      const next = vi.fn();

      await articlesFeed(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ articles, articlesCount }] = res.json.mock.calls[0];
      expect(articlesCount).toBe(1);
      expect(articles[0].slug).toBe("a");
    });
  });

  describe("singleArticle", () => {
    test("returns the article by slug", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const article = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);

      const { singleArticle } = loadArticlesController(db);
      const req = { loggedUser: undefined, params: { slug: "a" } };
      const res = buildRes();
      const next = vi.fn();

      await singleArticle(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ article: found }] = res.json.mock.calls[0];
      expect(found.slug).toBe("a");
    });

    test("throws NotFoundError when the slug doesn't exist", async () => {
      const db = await buildTestDb();
      const { singleArticle } = loadArticlesController(db);
      const req = { loggedUser: undefined, params: { slug: "ghost" } };
      const res = buildRes();
      const next = vi.fn();

      await singleArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });
  });

  describe("updateArticle", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { updateArticle } = loadArticlesController(db);
      const req = {
        loggedUser: undefined,
        params: { slug: "a" },
        body: { article: {} },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("throws NotFoundError when the slug doesn't exist", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { updateArticle } = loadArticlesController(db);
      const req = {
        loggedUser,
        params: { slug: "ghost" },
        body: { article: {} },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("throws ForbiddenError when the logged-in user isn't the author", async () => {
      const db = await buildTestDb();
      const author = await createUser(db, {
        username: "jake",
        email: "jake@jake.jake",
      });
      const other = await createUser(db, {
        username: "mallory",
        email: "m@m.m",
      });
      const article = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);

      const { updateArticle } = loadArticlesController(db);
      const req = {
        loggedUser: other,
        params: { slug: "a" },
        body: { article: { title: "New" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("ForbiddenError");
    });

    test("updates title/description/body and regenerates the slug when the author matches", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const article = await db.Article.create({
        slug: "old-title",
        title: "Old title",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);

      const { updateArticle } = loadArticlesController(db);
      const req = {
        loggedUser: author,
        params: { slug: "old-title" },
        body: { article: { title: "New Title", description: "new d" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await updateArticle(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const persisted = await db.Article.findOne({
        where: { slug: "new-title" },
      });
      expect(persisted).not.toBeNull();
      expect(persisted.title).toBe("New Title");
      expect(persisted.description).toBe("new d");
      expect(persisted.body).toBe("b");
    });
  });

  describe("deleteArticle", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { deleteArticle } = loadArticlesController(db);
      const req = { loggedUser: undefined, params: { slug: "a" } };
      const res = buildRes();
      const next = vi.fn();

      await deleteArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("throws NotFoundError when the slug doesn't exist", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { deleteArticle } = loadArticlesController(db);
      const req = { loggedUser, params: { slug: "ghost" } };
      const res = buildRes();
      const next = vi.fn();

      await deleteArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("throws ForbiddenError when the logged-in user isn't the author", async () => {
      const db = await buildTestDb();
      const author = await createUser(db, {
        username: "jake",
        email: "jake@jake.jake",
      });
      const other = await createUser(db, {
        username: "mallory",
        email: "m@m.m",
      });
      const article = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);

      const { deleteArticle } = loadArticlesController(db);
      const req = { loggedUser: other, params: { slug: "a" } };
      const res = buildRes();
      const next = vi.fn();

      await deleteArticle(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("ForbiddenError");
    });

    test("deletes the article when the author matches", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const article = await db.Article.create({
        slug: "a",
        title: "A",
        description: "d",
        body: "b",
      });
      await article.setAuthor(author);

      const { deleteArticle } = loadArticlesController(db);
      const req = { loggedUser: author, params: { slug: "a" } };
      const res = buildRes();
      const next = vi.fn();

      await deleteArticle(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const persisted = await db.Article.findOne({ where: { slug: "a" } });
      expect(persisted).toBeNull();
    });
  });
});
