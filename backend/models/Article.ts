"use strict";
import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";

export = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: Record<string, unknown>) {
    const { User, Tag, Comment } = models;
      // define association here

      // Users
      this.belongsTo(User as never, { foreignKey: "userId", as: "author" });

      // Comments
      this.hasMany(Comment as never, { foreignKey: "articleId", onDelete: "cascade" });

      // Tag list
      this.belongsToMany(Tag as never, {
        through: "TagList",
        as: "tagList",
        foreignKey: "articleId",
        timestamps: false,
        onDelete: "cascade", // FIXME: delete tags
      });

      // Favorites -- aliased to match User's own "favorites" alias for this
      // same relation, instead of leaving this side unaliased (which
      // generated a different, harder-to-guess method vocabulary --
      // hasUser/addUser/removeUser/countUsers -- for one logical
      // relationship). Verified the generated accessor names directly
      // (Sequelize's pluralization doesn't handle every alias predictably)
      // before picking this one.
      this.belongsToMany(User as never, {
        through: "Favorites",
        as: "favoritingUsers",
        foreignKey: "articleId",
        timestamps: false,
      });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        userId: undefined,
      };
    }
  }
  Article.init(
    {
      slug: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      body: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Article",
    },
  );
  return Article;
};
