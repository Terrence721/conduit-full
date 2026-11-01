"use strict";
import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";

export = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models: Record<string, unknown>) {
    const { User, Article } = models;
      // define association here

      // Comments
      this.belongsTo(Article as never, { foreignKey: "articleId" });
      this.belongsTo(User as never, { as: "author", foreignKey: "userId" });
    }

    toJSON() {
      return {
        ...this.get(),
        articleId: undefined,
        userId: undefined,
      };
    }
  }
  Comment.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      body: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Comment",
    },
  );
  return Comment;
};
