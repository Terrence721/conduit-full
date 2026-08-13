const { buildTestDb, installTestDb } = require("../testUtils/testDb");

const loadFavoritesController = (db) => {
  installTestDb(db);
  delete require.cache[require.resolve("./favorites")];
  return require("./favorites");
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

const createArticle = async (db, author) => {
  const article = await db.Article.create({
    slug: "how-to-train-your-dragon",
    title: "How to train your dragon",
    description: "d",
    body: "b",
  });
  await article.setAuthor(author);
  return article;
};

describe("controllers/favorites.js", () => {
  test("throws UnauthorizedError when there's no logged-in user", async () => {
    const db = await buildTestDb();
    const { favoriteToggler } = loadFavoritesController(db);
    const req = {
      method: "POST",
      loggedUser: undefined,
      params: { slug: "a" },
    };
    const res = buildRes();
    const next = vi.fn();

    await favoriteToggler(req, res, next);

    expect(next.mock.calls[0][0].name).toBe("UnauthorizedError");
  });

  test("throws NotFoundError when the article slug doesn't exist", async () => {
    const db = await buildTestDb();
    const loggedUser = await createUser(db);
    const { favoriteToggler } = loadFavoritesController(db);
    const req = { method: "POST", loggedUser, params: { slug: "ghost" } };
    const res = buildRes();
    const next = vi.fn();

    await favoriteToggler(req, res, next);

    expect(next.mock.calls[0][0].name).toBe("NotFoundError");
  });

  test("POST favorites the article and persists it", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const fan = await createUser(db, {
      username: "jane",
      email: "jane@jane.jane",
    });
    const article = await createArticle(db, author);

    const { favoriteToggler } = loadFavoritesController(db);
    const req = {
      method: "POST",
      loggedUser: fan,
      params: { slug: article.slug },
    };
    const res = buildRes();
    const next = vi.fn();

    await favoriteToggler(req, res, next);

    expect(next).not.toHaveBeenCalled();
    const [{ article: found }] = res.json.mock.calls[0];
    expect(found.dataValues.favorited).toBe(true);
    expect(found.dataValues.favoritesCount).toBe(1);

    const persisted = await db.Article.findOne({
      where: { slug: article.slug },
    });
    expect(await persisted.hasUser(fan)).toBe(true);
  });

  test("DELETE unfavorites the article and persists it", async () => {
    const db = await buildTestDb();
    const author = await createUser(db);
    const fan = await createUser(db, {
      username: "jane",
      email: "jane@jane.jane",
    });
    const article = await createArticle(db, author);
    await fan.addFavorite(article);

    const { favoriteToggler } = loadFavoritesController(db);
    const req = {
      method: "DELETE",
      loggedUser: fan,
      params: { slug: article.slug },
    };
    const res = buildRes();
    const next = vi.fn();

    await favoriteToggler(req, res, next);

    expect(next).not.toHaveBeenCalled();
    const [{ article: found }] = res.json.mock.calls[0];
    expect(found.dataValues.favorited).toBe(false);
    expect(found.dataValues.favoritesCount).toBe(0);

    const persisted = await db.Article.findOne({
      where: { slug: article.slug },
    });
    expect(await persisted.hasUser(fan)).toBe(false);
  });
});
