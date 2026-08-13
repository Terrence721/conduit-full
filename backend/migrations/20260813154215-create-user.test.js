const Sequelize = require("sequelize");
const migration = require("./20260813154215-create-user");
const defineUser = require("../models/User");

describe("migrations/20260813154215-create-user", () => {
  test("up creates the Users table matching User.js's field shape", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable }, Sequelize);

    expect(createTable).toHaveBeenCalledWith("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: { type: Sequelize.STRING },
      username: { type: Sequelize.STRING },
      bio: { type: Sequelize.TEXT, defaultValue: null },
      image: { type: Sequelize.TEXT, defaultValue: null },
      password: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  });

  test("column set matches the real User.js model", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const User = defineUser(sequelize, Sequelize.DataTypes);

    for (const column of ["email", "username", "bio", "image", "password"]) {
      expect(User.rawAttributes).toHaveProperty(column);
    }
  });

  test("down drops the Users table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable }, Sequelize);

    expect(dropTable).toHaveBeenCalledWith("Users");
  });
});
