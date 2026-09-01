export {};

import { Sequelize, DataTypes } from "sequelize";
import migration from "./20260813154215-create-user";
import defineUser from "../models/User";

describe("migrations/20260813154215-create-user", () => {
  test("up creates the Users table matching User.ts's field shape", async () => {
    const createTable = vi.fn();

    await migration.up({ createTable } as any, DataTypes);

    expect(createTable).toHaveBeenCalledWith("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: { type: DataTypes.STRING },
      username: { type: DataTypes.STRING },
      bio: { type: DataTypes.TEXT, defaultValue: null },
      image: { type: DataTypes.TEXT, defaultValue: null },
      password: { type: DataTypes.STRING },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
  });

  test("column set matches the real User.ts model", () => {
    const sequelize = new Sequelize("test", "test", "test", {
      dialect: "postgres",
      logging: false,
    });
    const User = defineUser(sequelize, DataTypes);

    for (const column of ["email", "username", "bio", "image", "password"]) {
      expect(User.rawAttributes).toHaveProperty(column);
    }
  });

  test("down drops the Users table", async () => {
    const dropTable = vi.fn();

    await migration.down({ dropTable } as any);

    expect(dropTable).toHaveBeenCalledWith("Users");
  });
});
