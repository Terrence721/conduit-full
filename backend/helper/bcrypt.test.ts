export {};

import bcryptHelper from "./bcrypt";
const { bcryptHash, bcryptCompare } = bcryptHelper;

describe("helper/bcrypt.ts", () => {
  test("bcryptHash produces a hash bcryptCompare verifies against the original password", async () => {
    const hash = await bcryptHash("correct horse battery staple");

    expect(await bcryptCompare("correct horse battery staple", hash)).toBe(
      true,
    );
  });

  test("bcryptCompare rejects the wrong password", async () => {
    const hash = await bcryptHash("correct horse battery staple");

    expect(await bcryptCompare("wrong password", hash)).toBe(false);
  });

  test("bcryptHash uses a cost factor of 12", async () => {
    const hash = await bcryptHash("correct horse battery staple");

    // bcrypt hash format: $<algorithm>$<cost>$<salt+hash>
    expect(hash.split("$")[2]).toBe("12");
  });
});
