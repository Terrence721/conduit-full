"use strict";

import type { QueryInterface } from "sequelize";
import bcryptHelper from "../helper/bcrypt";

const { bcryptHash } = bcryptHelper;

export = {
  async up(queryInterface: QueryInterface) {
    const users = await Promise.all(
      Array(5)
        .fill(null)
        .map(async (_, index) => ({
          username: `exampleUser${index + 1}`,
          email: `example${index + 1}@mail.com`,
          password: await bcryptHash(`examplePwd${index + 1}`),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
    );

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("Users", {}, {});
  },
};
