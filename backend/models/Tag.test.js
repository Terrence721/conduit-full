const { Sequelize } = require("sequelize");
const defineTag = require("./Tag");

const buildSequelize = () =>
  new Sequelize("test", "test", "test", {
    dialect: "postgres",
    logging: false,
  });

describe("models/Tag.js", () => {
  test("defines name as its primary key, with no timestamps", () => {
    const Tag = defineTag(buildSequelize(), Sequelize.DataTypes);

    expect(Object.keys(Tag.rawAttributes)).toEqual(["name"]);
    expect(Tag.rawAttributes.name.primaryKey).toBe(true);
    expect(Tag.options.timestamps).toBe(false);
  });

  test("toJSON only hides TagList, not id or userId (which don't exist on Tag)", () => {
    const Tag = defineTag(buildSequelize(), Sequelize.DataTypes);
    const tag = Tag.build({ name: "dragons" });

    const json = tag.toJSON();

    // id/userId are truly absent (Tag never had them); TagList is present
    // but undefined until JSON.stringify (as res.json() does) drops it.
    expect(json).not.toHaveProperty("id");
    expect(json).not.toHaveProperty("userId");
    expect(Object.keys(JSON.parse(JSON.stringify(json)))).toEqual(["name"]);
    expect(json.name).toBe("dragons");
  });

  describe("associate", () => {
    test("belongs to many Articles through tagName", () => {
      const sequelize = buildSequelize();
      const Tag = defineTag(sequelize, Sequelize.DataTypes);
      const Article = sequelize.define("Article", {});

      Tag.associate({ Article });

      expect(Tag.associations.Articles.foreignKey).toBe("tagName");
    });
  });
});
