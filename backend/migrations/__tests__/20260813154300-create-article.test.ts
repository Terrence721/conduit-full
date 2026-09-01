export {};

import { Sequelize, DataTypes } from "sequelize";
import migration from "../20260813154300-create-article";
import defineArticle from "../../models/Article";

describe("migrations/20260813154300-create-article", () => {
  test("up creates the Articles table, including the userId FK the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("Articles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      slug: { type: DataTypes.STRING },
      title: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
      body: { type: DataTypes.TEXT },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
  });

  test("column set matches the real Article.ts model, including its associated userId", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Article = defineArticle(sequelize, DataTypes);
    const User = sequelize.define("User", {});
    const Tag = sequelize.define("Tag", {});
    const Comment = sequelize.define("Comment", {});
    Article.associate({ User, Tag, Comment });

    for (const column of ["slug", "title", "description", "body", "userId"]) {
      expect(Article.rawAttributes).toHaveProperty(column);
    }
  });

  test("down drops the Articles table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("Articles");
  });
});
