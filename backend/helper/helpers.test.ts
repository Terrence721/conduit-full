export {};

import helpers from "./helpers";
import testDbModule from "../testUtils/testDb";
const { slugify, findArticleBySlugOrFail, parsePagination } = helpers;
const { buildTestDb } = testDbModule;

describe("Slugify", () => {
  const stringsArray = [
    "  Hello World  ",
    "  Hello WORLD  ",
    " HELLO WORLD",
    "Hello World",
    "Hello_world ",
    "Hello-world",
  ];

  test.each(stringsArray)("%p", (string) => {
    expect(slugify(string)).toBe("hello-world");
  });
});

describe("findArticleBySlugOrFail", () => {
  test("returns the article when it exists", async () => {
    const db = await buildTestDb();
    await db.Article.create({
      slug: "a",
      title: "A",
      description: "d",
      body: "b",
    });

    const article = await findArticleBySlugOrFail(db.Article, "a");

    expect(article.slug).toBe("a");
  });

  test("throws NotFoundError when no article matches the slug", async () => {
    const db = await buildTestDb();

    await expect(
      findArticleBySlugOrFail(db.Article, "missing"),
    ).rejects.toThrow("Article not found");
  });

  test("applies the given include option", async () => {
    const db = await buildTestDb();
    const author = await db.User.create({
      username: "jake",
      email: "jake@jake.jake",
      password: "hashed",
    });
    const article = await db.Article.create({
      slug: "a",
      title: "A",
      description: "d",
      body: "b",
    });
    await article.setAuthor(author);

    const found = await findArticleBySlugOrFail(db.Article, "a", [
      { model: db.User, as: "author" },
    ]);

    expect(found.author.username).toBe("jake");
  });
});

describe("parsePagination", () => {
  test("defaults to limit 3, offset 0 when the query is empty", () => {
    expect(parsePagination({})).toEqual({ limit: 3, offset: 0 });
  });

  test("multiplies the page index (offset) by limit for the real row offset", () => {
    expect(parsePagination({ limit: "5", offset: "2" })).toEqual({
      limit: 5,
      offset: 10,
    });
  });

  test("falls back to the defaults instead of NaN when limit is unparseable", () => {
    expect(parsePagination({ limit: "abc", offset: "2" })).toEqual({
      limit: 3,
      offset: 6,
    });
  });

  test("falls back to the defaults instead of NaN when offset is unparseable", () => {
    expect(parsePagination({ limit: "5", offset: "abc" })).toEqual({
      limit: 5,
      offset: 0,
    });
  });
});
