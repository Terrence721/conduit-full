export {};

const { buildTestDb } = require("../testUtils/testDb");
const { bcryptCompare } = require("../helper/bcrypt");

describe("seeders/20260813210638-create-users.ts", () => {
  test("up() inserts 5 users with real bcrypt-hashed passwords, not plain text", async () => {
    const db = await buildTestDb();
    const seeder = (await import("./20260813210638-create-users")).default;
    const queryInterface = db.sequelize.getQueryInterface();

    await seeder.up(queryInterface);

    const users = await db.User.findAll();
    expect(users).toHaveLength(5);

    const first = users.find((u: any) => u.username === "exampleUser1");
    expect(first.email).toBe("example1@mail.com");
    // The bug this guards against: the original seeder bulkInsert'd the raw
    // examplePwd1 string directly, so bcryptCompare against it would always
    // return false and no seeded user could ever actually log in.
    expect(await bcryptCompare("examplePwd1", first.password)).toBe(true);
    expect(first.password).not.toBe("examplePwd1");
  });

  test("down() removes all seeded users", async () => {
    const db = await buildTestDb();
    const seeder = (await import("./20260813210638-create-users")).default;
    const queryInterface = db.sequelize.getQueryInterface();

    await seeder.up(queryInterface);
    expect(await db.User.count()).toBe(5);

    await seeder.down(queryInterface);
    expect(await db.User.count()).toBe(0);
  });
});
