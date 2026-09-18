import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import getUser from "./getUser";
import type { User } from "../types";

vi.mock("../helpers/apiRequest");

describe("getUser", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the user on success", async () => {
    const user = { username: "exampleUser1" } as User;
    mockedApiRequest.mockResolvedValueOnce({ user });

    const result = await getUser({});

    expect(result).toEqual(user);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: undefined,
      url: "/api/user",
    });
  });

  test("passes headers through when provided", async () => {
    await getUser({ headers: authHeaders });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      url: "/api/user",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(getUser({})).resolves.toBeUndefined();
  });
});
