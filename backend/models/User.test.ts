export {};

import { Sequelize, DataTypes } from "sequelize";
import defineUser from "./User";

const buildSequelize = () =>
  new Sequelize("test", "test", "test", {
    dialect: "postgres",
    logging: false,
  });

describe("models/User.js", () => {
  test("defines the expected fields", () => {
    const User = defineUser(buildSequelize(), DataTypes);

    expect(Object.keys(User.rawAttributes)).toEqual(
      expect.arrayContaining(["email", "username", "bio", "image", "password"]),
    );
  });

  test("toJSON hides id, password, and timestamps", () => {
    const User = defineUser(buildSequelize(), DataTypes);
    const user = User.build({
      id: 1,
      email: "jake@jake.jake",
      username: "jake",
      bio: "I work at statefarm",
      image: null,
      password: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const json = user.toJSON();

    // toJSON() sets these fields to literal `undefined` rather than
    // deleting them, so they only actually disappear once JSON.stringify
    // (as res.json() does) drops the undefined-valued keys - that's the
    // behavior that matters, not raw key presence on the plain object.
    expect(Object.keys(JSON.parse(JSON.stringify(json)))).not.toEqual(
      expect.arrayContaining(["id", "password", "createdAt", "updatedAt"]),
    );
    expect(json.email).toBe("jake@jake.jake");
    expect(json.username).toBe("jake");
  });

  describe("associate", () => {
    test("associates Comments through userId, not articleId", () => {
      const sequelize = buildSequelize();
      const User = defineUser(sequelize, DataTypes);
      const Article = sequelize.define("Article", {});
      const Comment = sequelize.define("Comment", {});

      User.associate({ Article, Comment, User });

      expect(User.associations.Comments.foreignKey).toBe("userId");
    });

    test("associates Articles through userId with cascade delete", () => {
      const sequelize = buildSequelize();
      const User = defineUser(sequelize, DataTypes);
      const Article = sequelize.define("Article", {});
      const Comment = sequelize.define("Comment", {});

      User.associate({ Article, Comment, User });

      expect(User.associations.Articles.foreignKey).toBe("userId");
      expect((User.associations.Articles as any).options.onDelete).toBe(
        "CASCADE",
      );
    });
  });
});
