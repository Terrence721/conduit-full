import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import getProfile from "./getProfile";
import type { Profile } from "../types";

vi.mock("../helpers/apiRequest");

describe("getProfile", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the profile on success", async () => {
    const profile = { username: "exampleUser1" } as Profile;
    mockedApiRequest.mockResolvedValueOnce({ profile });

    const result = await getProfile({ username: "exampleUser1" });

    expect(result).toEqual(profile);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: undefined,
      url: "/api/profiles/exampleUser1",
    });
  });

  test("passes headers through when provided", async () => {
    await getProfile({ headers: authHeaders, username: "exampleUser1" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      url: "/api/profiles/exampleUser1",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      getProfile({ username: "exampleUser1" }),
    ).resolves.toBeUndefined();
  });
});
