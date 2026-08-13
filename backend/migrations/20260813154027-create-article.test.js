const Sequelize = require("sequelize");
const migration = require("./20260813154027-create-article");
const defineArticle = require("../models/Article");

describe("migrations/20260813154027-create-article", () => {
  test("up creates the Articles table, including the userId FK the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable }, Sequelize);

    expect(createTable).toHaveBeenCalledWith("Articles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      slug: { type: Sequelize.STRING },
      title: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      body: { type: Sequelize.TEXT },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  });

  test("column set matches the real Article.js model, including its associated userId", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Article = defineArticle(sequelize, Sequelize.DataTypes);
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

    await migration.down({ dropTable }, Sequelize);

    expect(dropTable).toHaveBeenCalledWith("Articles");
  });
});
