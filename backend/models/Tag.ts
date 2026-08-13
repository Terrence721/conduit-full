"use strict";
import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";

export = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Article }: any) {
      // define association here

      // Tag list
      this.belongsToMany(Article, {
        through: "TagList",
        foreignKey: "tagName",
        timestamps: false,
      });
    }

    toJSON() {
      return {
        ...this.get(),
        TagList: undefined,
      };
    }
  }
  Tag.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "Tag",
      timestamps: false,
    },
  );
  return Tag;
};
