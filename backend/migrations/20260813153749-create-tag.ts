"use strict";

import type { QueryInterface } from "sequelize";
import { DataTypes as DataTypesType } from "sequelize";

export = {
  async up(queryInterface: QueryInterface, DataTypes: typeof DataTypesType) {
    await queryInterface.createTable("Tags", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("Tags");
  },
};
