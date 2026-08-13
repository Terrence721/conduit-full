export {};

import { Sequelize, DataTypes } from "sequelize";
import defineArticle from "./Article";

const buildSequelize = () =>
  new Sequelize("test", "test", "test", {
    dialect: "postgres",
    logging: false,
  });

describe("models/Article.js", () => {
  test("defines the expected fields", () => {
    const Article = defineArticle(buildSequelize(), DataTypes);

    expect(Object.keys(Article.rawAttributes)).toEqual(
      expect.arrayContaining(["slug", "title", "description", "body"]),
    );
  });

  test("toJSON hides id and userId", () => {
    const Article = defineArticle(buildSequelize(), DataTypes);
    const article = Article.build({
      id: 1,
      userId: 2,
      slug: "how-to-train-your-dragon",
      title: "How to train your dragon",
      description: "Ever wonder how?",
      body: "It takes a Jacobian",
    });

    const json = article.toJSON();

    expect(Object.keys(JSON.parse(JSON.stringify(json)))).not.toEqual(
      expect.arrayContaining(["id", "userId"]),
    );
    expect(json.slug).toBe("how-to-train-your-dragon");
    expect(json.title).toBe("How to train your dragon");
  });

  describe("associate", () => {
    const buildAssociatedArticle = () => {
      const sequelize = buildSequelize();
      const Article = defineArticle(sequelize, DataTypes);
      const User = sequelize.define("User", {});
      const Tag = sequelize.define("Tag", {
        name: { type: DataTypes.STRING, primaryKey: true },
      });
      const Comment = sequelize.define("Comment", {});

      Article.associate({ User, Tag, Comment });

      return Article;
    };

    test("belongs to an author (User) through userId", () => {
      const Article = buildAssociatedArticle();

      expect(Article.associations.author.foreignKey).toBe("userId");
    });

    test("has many Comments through articleId", () => {
      const Article = buildAssociatedArticle();

      expect(Article.associations.Comments.foreignKey).toBe("articleId");
    });

    test("has many Tags (as tagList) through articleId", () => {
      const Article = buildAssociatedArticle();

      expect(Article.associations.tagList.foreignKey).toBe("articleId");
    });

    test("has many favoriting Users through articleId", () => {
      const Article = buildAssociatedArticle();

      expect(Article.associations.Users.foreignKey).toBe("articleId");
    });
  });
});
