"use strict";

import type { QueryInterface } from "sequelize";
import { DataTypes as DataTypesType } from "sequelize";

export = {
  async up(queryInterface: QueryInterface, DataTypes: typeof DataTypesType) {
    await queryInterface.createTable("Followers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      followerId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("Followers");
  },
};
