export {};

import { Sequelize, DataTypes, type BelongsToMany } from "sequelize";
import migration from "../20260813154700-create-favorites";
import defineUser from "../../models/User";
import defineArticle from "../../models/Article";

describe("migrations/20260813154700-create-favorites", () => {
  test("up creates the Favorites table, including the userId/articleId FKs the model needs", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("Favorites", {
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
      articleId: {
        type: DataTypes.INTEGER,
        references: { model: "Articles", key: "id" },
      },
    });
  });

  test("columns match User/Article's real belongsToMany association", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const User = defineUser(sequelize, DataTypes);
    const Article = defineArticle(sequelize, DataTypes);
    const Tag = sequelize.define("Tag", {});
    const Comment = sequelize.define("Comment", {});
    User.associate({ Article, Comment, User });
    Article.associate({ User, Tag, Comment });

    const association = User.associations.favorites as BelongsToMany;
    const through = association as unknown as {
      through: { model: { tableName?: string; name: string } };
    };
    expect(through.through.model.tableName ?? through.through.model.name).toBe(
      "Favorites",
    );
    expect(association.foreignKey).toBe("userId");
    expect(association.otherKey).toBe("articleId");
  });

  test("down drops the Favorites table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("Favorites");
  });
});
