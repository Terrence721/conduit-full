export {};

import { Sequelize, DataTypes } from "sequelize";
import defineComment from "./Comment";

const buildSequelize = () =>
  new Sequelize("test", "test", "test", {
    dialect: "postgres",
    logging: false,
  });

describe("models/Comment.js", () => {
  test("defines the expected fields", () => {
    const Comment = defineComment(buildSequelize(), DataTypes);

    expect(Object.keys(Comment.rawAttributes)).toEqual(
      expect.arrayContaining(["id", "body"]),
    );
  });

  test("toJSON hides articleId and userId, but keeps id", () => {
    const Comment = defineComment(buildSequelize(), DataTypes);
    const comment = Comment.build({
      id: 1,
      articleId: 2,
      userId: 3,
      body: "His name was my name too.",
    });

    const json = comment.toJSON();

    expect(Object.keys(JSON.parse(JSON.stringify(json)))).not.toEqual(
      expect.arrayContaining(["articleId", "userId"]),
    );
    expect(json.id).toBe(1);
    expect(json.body).toBe("His name was my name too.");
  });

  describe("associate", () => {
    const buildAssociatedComment = () => {
      const sequelize = buildSequelize();
      const Comment = defineComment(sequelize, DataTypes);
      const User = sequelize.define("User", {});
      const Article = sequelize.define("Article", {});

      Comment.associate({ User, Article });

      return Comment;
    };

    test("belongs to an Article through articleId", () => {
      const Comment = buildAssociatedComment();

      expect(Comment.associations.Article.foreignKey).toBe("articleId");
    });

    test("belongs to an author (User) through userId", () => {
      const Comment = buildAssociatedComment();

      expect(Comment.associations.author.foreignKey).toBe("userId");
    });
  });
});
