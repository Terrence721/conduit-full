export {};

import { Sequelize, DataTypes } from "sequelize";
import migration from "./20260813154538-create-comment";
import defineComment from "../models/Comment";

describe("migrations/20260813154538-create-comment", () => {
  test("up creates the Comments table, including the articleId/userId FKs the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      body: { type: DataTypes.TEXT },
      articleId: {
        type: DataTypes.INTEGER,
        references: { model: "Articles", key: "id" },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
      },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
  });

  test("column set matches the real Comment.ts model, including its associated FKs", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Comment = defineComment(sequelize, DataTypes);
    const User = sequelize.define("User", {});
    const Article = sequelize.define("Article", {});
    Comment.associate({ User, Article });

    for (const column of ["body", "articleId", "userId"]) {
      expect(Comment.rawAttributes).toHaveProperty(column);
    }
  });

  test("down drops the Comments table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("Comments");
  });
});
