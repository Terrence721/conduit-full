export {};

import { Sequelize, DataTypes, type BelongsToMany } from "sequelize";
import migration from "../20260813154600-create-tag-list";
import defineArticle from "../../models/Article";
import defineTag from "../../models/Tag";

describe("migrations/20260813154600-create-tag-list", () => {
  test("up creates the TagList table, including the articleId/tagName FKs the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("TagList", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      articleId: {
        type: DataTypes.INTEGER,
        references: { model: "Articles", key: "id" },
        onDelete: "CASCADE",
      },
      tagName: {
        type: DataTypes.STRING,
        references: { model: "Tags", key: "name" },
      },
    });
  });

  test("columns match Article/Tag's real belongsToMany association", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const Article = defineArticle(sequelize, DataTypes);
    const Tag = defineTag(sequelize, DataTypes);
    const User = sequelize.define("User", {});
    const Comment = sequelize.define("Comment", {});
    Article.associate({ User, Tag, Comment });
    Tag.associate({ Article });

    const association = Article.associations.tagList as BelongsToMany;
    const through = association as unknown as {
      through: { model: { tableName?: string; name: string } };
    };
    expect(through.through.model.tableName ?? through.through.model.name).toBe(
      "TagList",
    );
    expect(association.foreignKey).toBe("articleId");
    expect(association.otherKey).toBe("tagName");
  });

  test("down drops the TagList table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("TagList");
  });
});
