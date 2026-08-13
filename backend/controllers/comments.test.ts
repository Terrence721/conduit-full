export {};

import testDbModule from "../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;

const loadCommentsController = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  return (await import("./comments")).default;
};

const buildRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createUser = async (db: any, overrides = {}) => {
  const user = await db.User.create({
    username: "jake",
    email: "jake@jake.jake",
    password: "hashed",
    ...overrides,
  });
  user.dataValues.token = "fake-token";
  return user;
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

describe("controllers/comments.js", () => {
  describe("allComments", () => {
    test("returns an article's comments with author/followers appended", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const article = await createArticle(db, author);
      await db.Comment.create({
        body: "His name was my name too.",
        articleId: article.id,
        userId: author.id,
      });

      const { allComments } = await loadCommentsController(db);
      const req: any = {
        loggedUser: undefined,
        params: { slug: article.slug },
      };
      const res = buildRes();
      const next = vi.fn();

      await allComments(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const [{ comments }] = res.json.mock.calls[0];
      expect(comments).toHaveLength(1);
      expect(comments[0].body).toBe("His name was my name too.");
      expect(comments[0].author.username).toBe("jake");
      // appendFollowers sets this on the comment's author sub-object, not
      // the comment itself - followers describe the author, not the comment.
      expect(comments[0].author.dataValues.followersCount).toBe(0);
    });

    test("throws NotFoundError when the article slug doesn't exist", async () => {
      const db = await buildTestDb();
      const { allComments } = await loadCommentsController(db);
      const req: any = { loggedUser: undefined, params: { slug: "ghost" } };
      const res = buildRes();
      const next = vi.fn();

      await allComments(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });
  });

  describe("createComment", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { createComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser: undefined,
        params: { slug: "a" },
        body: { comment: { body: "hi" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await createComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("throws FieldRequiredError when body is missing", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { createComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser,
        params: { slug: "a" },
        body: { comment: {} },
      };
      const res = buildRes();
      const next = vi.fn();

      await createComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("FieldRequiredError");
    });

    test("throws NotFoundError when the article slug doesn't exist", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { createComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser,
        params: { slug: "ghost" },
        body: { comment: { body: "hi" } },
      };
      const res = buildRes();
      const next = vi.fn();

      await createComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("creates a comment persisted against the right article and user", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const article = await createArticle(db, loggedUser);
      const { createComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser,
        params: { slug: article.slug },
        body: { comment: { body: "His name was my name too." } },
      };
      const res = buildRes();
      const next = vi.fn();

      await createComment(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const [{ comment }] = res.json.mock.calls[0];
      const persisted = await db.Comment.findByPk(comment.id);
      expect(persisted.articleId).toBe(article.id);
      expect(persisted.userId).toBe(loggedUser.id);
    });
  });

  describe("deleteComment", () => {
    test("throws UnauthorizedError when there's no logged-in user", async () => {
      const db = await buildTestDb();
      const { deleteComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser: undefined,
        params: { slug: "a", commentId: 1 },
      };
      const res = buildRes();
      const next = vi.fn();

      await deleteComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
    });

    test("throws NotFoundError when the article slug doesn't exist", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const { deleteComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser,
        params: { slug: "ghost", commentId: 1 },
      };
      const res = buildRes();
      const next = vi.fn();

      await deleteComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("throws NotFoundError when the commentId doesn't exist", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const article = await createArticle(db, loggedUser);
      const { deleteComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser,
        params: { slug: article.slug, commentId: 999 },
      };
      const res = buildRes();
      const next = vi.fn();

      await deleteComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("NotFoundError");
    });

    test("throws NotFoundError when the comment belongs to a different article than the slug (regression check)", async () => {
      const db = await buildTestDb();
      const loggedUser = await createUser(db);
      const article = await createArticle(db, loggedUser, {
        slug: "article-one",
        title: "Article One",
      });
      const otherArticle = await createArticle(db, loggedUser, {
        slug: "article-two",
        title: "Article Two",
      });
      const comment = await db.Comment.create({
        body: "on the other article",
        articleId: otherArticle.id,
        userId: loggedUser.id,
      });

      const { deleteComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser,
        params: { slug: article.slug, commentId: comment.id },
      };
      const res = buildRes();
      const next = vi.fn();

      await deleteComment(req, res, next);

      expect(res.json).not.toHaveBeenCalled();
      expect(next.mock.calls[0][0].name).toBe("NotFoundError");

      const stillThere = await db.Comment.findByPk(comment.id);
      expect(stillThere).not.toBeNull();
    });

    test("throws ForbiddenError when the logged-in user isn't the comment's author", async () => {
      const db = await buildTestDb();
      const author = await createUser(db, {
        username: "jake",
        email: "jake@jake.jake",
      });
      const other = await createUser(db, {
        username: "mallory",
        email: "m@m.m",
      });
      const article = await createArticle(db, author);
      const comment = await db.Comment.create({
        body: "hi",
        articleId: article.id,
        userId: author.id,
      });

      const { deleteComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser: other,
        params: { slug: article.slug, commentId: comment.id },
      };
      const res = buildRes();
      const next = vi.fn();

      await deleteComment(req, res, next);

      expect(next.mock.calls[0][0].name).toBe("ForbiddenError");
    });

    test("deletes the comment when the article and author both match", async () => {
      const db = await buildTestDb();
      const author = await createUser(db);
      const article = await createArticle(db, author);
      const comment = await db.Comment.create({
        body: "hi",
        articleId: article.id,
        userId: author.id,
      });

      const { deleteComment } = await loadCommentsController(db);
      const req: any = {
        loggedUser: author,
        params: { slug: article.slug, commentId: comment.id },
      };
      const res = buildRes();
      const next = vi.fn();

      await deleteComment(req, res, next);

      expect(next).not.toHaveBeenCalled();
      const persisted = await db.Comment.findByPk(comment.id);
      expect(persisted).toBeNull();
    });
  });
});
