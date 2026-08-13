const testDbEnv = {
  NODE_ENV: "test",
  TEST_DB_USERNAME: "postgres",
  TEST_DB_PASSWORD: "postgres",
  TEST_DB_NAME: "conduit_test",
  TEST_DB_HOSTNAME: "127.0.0.1",
  TEST_DB_DIALECT: "postgres",
  TEST_DB_LOGGING: "false",
};

// Plain CommonJS require(), not import() - vi.resetModules() only resets
// vitest's own vite-node module graph, not Node's native require.cache, so
// ./index and its config.js dependency have to be evicted by hand for each
// test to actually re-evaluate against that test's stubbed env vars.
const freshDb = () => {
  delete require.cache[require.resolve("./index")];
  delete require.cache[require.resolve("../config/config.js")];
  return require("./index");
};

describe("models/index.js", () => {
  beforeEach(() => {
    for (const [key, value] of Object.entries(testDbEnv)) {
      vi.stubEnv(key, value);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("builds a Sequelize instance from the test config block, without connecting", () => {
    const db = freshDb();

    expect(db.sequelize).toBeInstanceOf(db.Sequelize);
    expect(db.sequelize.getDatabaseName()).toBe("conduit_test");
    expect(db.sequelize.getDialect()).toBe("postgres");
  });

  test("coerces a truthy DB_LOGGING string into a real logging function, not a string", () => {
    vi.stubEnv("TEST_DB_LOGGING", "true");
    const db = freshDb();

    expect(db.sequelize.options.logging).toBe(console.log);
  });

  test("coerces a falsy DB_LOGGING string into logging: false", () => {
    const db = freshDb();

    expect(db.sequelize.options.logging).toBe(false);
  });

  test("exposes sequelize + Sequelize plus every model file alongside it", () => {
    const db = freshDb();

    expect(Object.keys(db).sort()).toEqual([
      "Article",
      "Comment",
      "Sequelize",
      "Tag",
      "User",
      "sequelize",
    ]);
  });

  test("wires every model's associate() correctly end to end", () => {
    const db = freshDb();

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
