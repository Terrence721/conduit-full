import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import toggleFollow from "./toggleFollow";
import type { Profile, ProfileResponse } from "../types";

vi.mock("../helpers/apiRequest");

describe("toggleFollow", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("unfollows (DELETE) when already following", async () => {
    const profile = { username: "jake" } as Profile;
    mockedApiRequest.mockResolvedValueOnce({ profile } as ProfileResponse);

    const result = await toggleFollow({
      following: true,
      headers: authHeaders,
      username: "jake",
    });

    expect(result).toEqual(profile);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      method: "DELETE",
      url: "/api/profiles/jake/follow",
    });
  });

  test("follows (POST) when not already following", async () => {
    const profile = { username: "jake" } as Profile;
    mockedApiRequest.mockResolvedValueOnce({ profile } as ProfileResponse);

    const result = await toggleFollow({
      following: false,
      headers: authHeaders,
      username: "jake",
    });

    expect(result).toEqual(profile);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      method: "POST",
      url: "/api/profiles/jake/follow",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      toggleFollow({
        following: false,
        headers: authHeaders,
        username: "jake",
      }),
    ).resolves.toBeUndefined();
  });
});
