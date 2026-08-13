// Shared test helper for controller tests: a real, in-memory SQLite
// Sequelize instance running the actual models/associations, instead of
// hand-stubbed mocks.
import { Sequelize, DataTypes } from "sequelize";
import defineUser from "../models/User";
import defineArticle from "../models/Article";
import defineComment from "../models/Comment";
import defineTag from "../models/Tag";

const buildTestDb = async () => {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });

  const db: any = {
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

// Registers a mock for "../models" (i.e. backend/models/index.ts) so
// anything that does `import models from "../models"` gets this
// real-but-in-memory db instead of the real models/index.ts, which needs an
// actual Postgres connection. Replaces the old require.cache-injection
// trick: now that models/index.ts is .ts, plain require() can no longer
// resolve it under Vitest at all (not even via a hand-built cache key), so
// interception has to happen at the ESM/vite-node level instead - which
// also means every consumer must use a real `import`, not require().
const installTestDb = (db: any) => {
  vi.doMock("../models", () => ({ default: db }));
};

export = { buildTestDb, installTestDb };
