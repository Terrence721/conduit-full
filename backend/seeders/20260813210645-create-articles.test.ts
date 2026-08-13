export {};

const { buildTestDb, installTestDb } = require("../testUtils/testDb");

const loadSeeder = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  return (await import("./20260813210645-create-articles")).default;
};

describe("seeders/20260813210645-create-articles.ts", () => {
  test("up() inserts 55 articles, each assigned to a real existing user", async () => {
    const db = await buildTestDb();
    await db.User.bulkCreate([
      { username: "jake", email: "jake@jake.jake", password: "hashed" },
      { username: "jane", email: "jane@jane.jane", password: "hashed" },
    ]);
    const seeder = await loadSeeder(db);
    const queryInterface = db.sequelize.getQueryInterface();

    await seeder.up(queryInterface);

    const articles = await db.Article.findAll();
    expect(articles).toHaveLength(55);

    const userIds = (await db.User.findAll()).map((u: any) => u.id);
    for (const article of articles) {
      expect(userIds).toContain(article.userId);
    }
  });

  test("down() removes all seeded articles", async () => {
    const db = await buildTestDb();
    await db.User.create({
      username: "jake",
      email: "jake@jake.jake",
      password: "hashed",
    });
    const seeder = await loadSeeder(db);
    const queryInterface = db.sequelize.getQueryInterface();

    await seeder.up(queryInterface);
    expect(await db.Article.count()).toBe(55);

    await seeder.down(queryInterface);
    expect(await db.Article.count()).toBe(0);
  });
});
