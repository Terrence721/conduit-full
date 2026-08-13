"use strict";

import type { QueryInterface } from "sequelize";
import { DataTypes as DataTypesType } from "sequelize";

export = {
  async up(queryInterface: QueryInterface, DataTypes: typeof DataTypesType) {
    await queryInterface.createTable("Comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      body: {
        type: DataTypes.TEXT,
      },
      articleId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Articles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("Comments");
  },
};
