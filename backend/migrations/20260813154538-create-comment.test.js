const Sequelize = require("sequelize");
const migration = require("./20260813154538-create-comment");
const defineComment = require("../models/Comment");

describe("migrations/20260813154538-create-comment", () => {
  test("up creates the Comments table, including the articleId/userId FKs the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable }, Sequelize);

    expect(createTable).toHaveBeenCalledWith("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      body: { type: Sequelize.TEXT },
      articleId: {
        type: Sequelize.INTEGER,
        references: { model: "Articles", key: "id" },
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  });

  test("column set matches the real Comment.js model, including its associated FKs", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Comment = defineComment(sequelize, Sequelize.DataTypes);
    const User = sequelize.define("User", {});
    const Article = sequelize.define("Article", {});
    Comment.associate({ User, Article });

    for (const column of ["body", "articleId", "userId"]) {
      expect(Comment.rawAttributes).toHaveProperty(column);
    }
  });

  test("down drops the Comments table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable }, Sequelize);

    expect(dropTable).toHaveBeenCalledWith("Comments");
  });
});
