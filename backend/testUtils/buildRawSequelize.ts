import { Sequelize } from "sequelize";

// A schema-only, unsynced Sequelize instance for tests that just need to
// define a model/migration's shape and inspect it -- distinct from
// testDb.ts's real, synced, in-memory SQLite instance used for controller
// tests that actually persist data.
const buildRawSequelize = () =>
  new Sequelize("test", "test", "test", {
    dialect: "postgres",
    logging: false,
  });

export = buildRawSequelize;
