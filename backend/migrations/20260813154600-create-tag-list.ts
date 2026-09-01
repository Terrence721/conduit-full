"use strict";

import type { QueryInterface } from "sequelize";
import { DataTypes as DataTypesType } from "sequelize";

export = {
  async up(queryInterface: QueryInterface, DataTypes: typeof DataTypesType) {
    await queryInterface.createTable("TagList", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      articleId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Articles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      tagName: {
        type: DataTypes.STRING,
        references: {
          model: "Tags",
          key: "name",
        },
      },
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("TagList");
  },
};
