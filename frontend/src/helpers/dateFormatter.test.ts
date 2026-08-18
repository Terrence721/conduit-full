import dateFormatter from "./dateFormatter";

it("should format an ISO string", () => {
  const ISOString = "2026-08-18T12:11:08.212Z";

  expect(dateFormatter(ISOString)).toBe("August 18, 2026");
});
