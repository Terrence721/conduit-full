export {};

import { Sequelize, DataTypes } from "sequelize";
import migration from "../20260813153749-create-tag";
import defineTag from "../../models/Tag";

describe("migrations/20260813153749-create-tag", () => {
  test("up creates the Tags table matching Tag.ts's field shape", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("Tags", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
    });

    // Cross-check against the real Tag.ts model definition, not just a
    // hardcoded expectation - catches migration/model drift.
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Tag = defineTag(sequelize, DataTypes);

    expect(Tag.rawAttributes.name.allowNull).toBe(false);
    expect(Tag.rawAttributes.name.primaryKey).toBe(true);
  });

  test("down drops the Tags table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("Tags");
  });
});
