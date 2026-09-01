"use strict";

import type { QueryInterface } from "sequelize";
import { randomInt } from "crypto";
import models from "../models";

const { User } = models;

export = {
  async up(queryInterface: QueryInterface) {
    const users = await User.findAll();

    // "Lorem ipsum..." is Latin, not any modern language -- standard
    // scrambled-text filler used throughout publishing/design since the
    // 16th century, chosen so dummy content doesn't read as real prose.
    const articles = Array(65)
      .fill(null)
      .map((_, index) => ({
        slug: `lorem-ipsum-${index + 1}`,
        title: `Lorem Ipsum ${index + 1}`,
        description: `${
          index + 1
        } - Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec ante lacinia magna ultricies cursus nec non lacus. Praesent blandit sodales semper. Mauris eget leo non erat molestie faucibus luctus sed ex. Duis sollicitudin tellus vitae aliquam cursus. Integer ultricies ultricies erat. Vivamus egestas ac augue nec mattis. Duis posuere bibendum ex vitae placerat. Duis in odio vestibulum, pellentesque odio vitae, egestas nibh.`,
        userId: users[randomInt(users.length)].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    await queryInterface.bulkInsert("Articles", articles, {});
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("Articles", {}, {});
  },
};
