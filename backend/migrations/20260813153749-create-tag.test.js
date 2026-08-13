const Sequelize = require("sequelize");
const migration = require("./20260813153749-create-tag");
const defineTag = require("../models/Tag");

describe("migrations/20260813153749-create-tag", () => {
  test("up creates the Tags table matching Tag.js's field shape", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable }, Sequelize);

    expect(createTable).toHaveBeenCalledWith("Tags", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
    });

    // Cross-check against the real Tag.js model definition, not just a
    // hardcoded expectation - catches migration/model drift.
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Tag = defineTag(sequelize, Sequelize.DataTypes);

    expect(Tag.rawAttributes.name.allowNull).toBe(false);
    expect(Tag.rawAttributes.name.primaryKey).toBe(true);
  });

  test("down drops the Tags table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable }, Sequelize);

    expect(dropTable).toHaveBeenCalledWith("Tags");
  });
});
