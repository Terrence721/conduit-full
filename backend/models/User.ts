"use strict";
import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";

export = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: Record<string, unknown>) {
      const { Article, Comment, User } = models;
      // define association here

      // Articles
      this.hasMany(Article as never, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });

      // Comments
      this.hasMany(Comment as never, { foreignKey: "userId" });

      // Favorites
      this.belongsToMany(Article as never, {
        through: "Favorites",
        as: "favorites",
        foreignKey: "userId",
        timestamps: false,
      });

      // Followers
      this.belongsToMany(User as never, {
        through: "Followers",
        as: "followers",
        foreignKey: "userId",
        timestamps: false,
      });
      this.belongsToMany(User as never, {
        through: "Followers",
        as: "following",
        foreignKey: "followerId",
        timestamps: false,
      });
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        password: undefined,
        updatedAt: undefined,
        createdAt: undefined,
      };
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      bio: DataTypes.TEXT,
      image: DataTypes.TEXT,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
