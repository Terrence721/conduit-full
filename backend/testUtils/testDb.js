// Shared test helper for controller tests: a real, in-memory SQLite
// Sequelize instance running the actual models/associations, instead of
// hand-stubbed mocks. Deliberately lives outside backend/models/ - if it
// sat there, models/index.js's dynamic file loader would try to require()
// it as a model factory too.
const { Sequelize, DataTypes } = require("sequelize");
const defineUser = require("../models/User");
const defineArticle = require("../models/Article");
const defineComment = require("../models/Comment");
const defineTag = require("../models/Tag");

const buildTestDb = async () => {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });

  const db = {
    User: defineUser(sequelize, DataTypes),
    Article: defineArticle(sequelize, DataTypes),
    Comment: defineComment(sequelize, DataTypes),
    Tag: defineTag(sequelize, DataTypes),
    sequelize,
    Sequelize,
  };

  for (const model of [db.User, db.Article, db.Comment, db.Tag]) {
    model.associate(db);
  }

  await sequelize.sync({ force: true });

  return db;
};

// Injects a built db into require.cache under the resolved path for
// "../models" (i.e. backend/models/index.js), so controllers that do
// require("../models") get this real-but-in-memory db instead of the real
// models/index.js, which needs an actual Postgres connection.
const installTestDb = (db) => {
  const modelsPath = require.resolve("../models");
  require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: db,
  };
};

module.exports = { buildTestDb, installTestDb };
