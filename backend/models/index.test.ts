export {};

// config.ts validates *_DB_DIALECT for all three environment blocks eagerly
// (not just the active NODE_ENV), matching .env.example's convention that
// all three are always present in a real .env - so DEV_/PROD_DB_DIALECT
// need valid stubs here too, even though only the "test" block is actually
// exercised below.
const testDbEnv = {
  NODE_ENV: "test",
  DEV_DB_DIALECT: "postgres",
  TEST_DB_USERNAME: "postgres",
  TEST_DB_PASSWORD: "postgres",
  TEST_DB_NAME: "conduit_test",
  TEST_DB_HOSTNAME: "127.0.0.1",
  TEST_DB_DIALECT: "postgres",
  TEST_DB_LOGGING: "false",
  PROD_DB_DIALECT: "postgres",
};

const freshDb = async () => {
  vi.resetModules();
  return (await import("./index")).default;
};

describe("models/index.ts", () => {
  beforeEach(() => {
    for (const [key, value] of Object.entries(testDbEnv)) {
      vi.stubEnv(key, value);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("builds a Sequelize instance from the test config block, without connecting", async () => {
    const db = await freshDb();

    expect(db.sequelize).toBeInstanceOf(db.Sequelize);
    expect(db.sequelize.getDatabaseName()).toBe("conduit_test");
    expect(db.sequelize.getDialect()).toBe("postgres");
  });

  test("coerces a truthy DB_LOGGING string into a real logging function, not a string", async () => {
    vi.stubEnv("TEST_DB_LOGGING", "true");
    const db = await freshDb();

    expect(db.sequelize.options.logging).toBe(console.log);
  });

  test("coerces a falsy DB_LOGGING string into logging: false", async () => {
    const db = await freshDb();

    expect(db.sequelize.options.logging).toBe(false);
  });

  test("exposes sequelize + Sequelize plus every model file alongside it", async () => {
    const db = await freshDb();

    expect(Object.keys(db).sort()).toEqual([
      "Article",
      "Comment",
      "Sequelize",
      "Tag",
      "User",
      "sequelize",
    ]);
  });

  test("wires every model's associate() correctly end to end", async () => {
    const db = await freshDb();

    expect(db.User.associations.Comments.foreignKey).toBe("userId");
    expect(db.User.associations.Articles.foreignKey).toBe("userId");
    expect(db.Article.associations.author.foreignKey).toBe("userId");
    expect(db.Article.associations.Comments.foreignKey).toBe("articleId");
    expect(db.Article.associations.tagList.foreignKey).toBe("articleId");
    expect(db.Comment.associations.Article.foreignKey).toBe("articleId");
    expect(db.Comment.associations.author.foreignKey).toBe("userId");
    expect(db.Tag.associations.Articles.foreignKey).toBe("tagName");
  });
});
