export {};

import { Sequelize, DataTypes, type BelongsToMany } from "sequelize";
import migration from "../20260813154800-create-followers";
import defineUser from "../../models/User";

describe("migrations/20260813154800-create-followers", () => {
  test("up creates the Followers table, including the userId/followerId FKs the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("Followers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
      },
      followerId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
      },
    });
  });

  test("columns match User's real self-referential belongsToMany association", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const User = defineUser(sequelize, DataTypes);
    const Article = sequelize.define("Article", {});
    const Comment = sequelize.define("Comment", {});
    User.associate({ Article, Comment, User });

    const association = User.associations.followers as BelongsToMany;
    const through = association as unknown as {
      through: { model: { tableName?: string; name: string } };
    };
    expect(through.through.model.tableName ?? through.through.model.name).toBe(
      "Followers",
    );
    expect(association.foreignKey).toBe("userId");
    expect(association.otherKey).toBe("followerId");
  });

  test("down drops the Followers table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("Followers");
  });
});
