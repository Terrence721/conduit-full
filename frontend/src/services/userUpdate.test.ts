import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import userUpdate from "./userUpdate";
import type { User } from "../types";

vi.mock("../helpers/apiRequest");

describe("userUpdate", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
    localStorage.clear();
  });

  test("builds AuthState, persists it, and returns it on success", async () => {
    const user = { username: "jake", token: "abc123" } as User;
    mockedApiRequest.mockResolvedValueOnce({ user });

    const result = await userUpdate({
      bio: "I work at statefarm",
      email: "jake@jake.jake",
      headers: authHeaders,
      image: "https://i.stack.imgur.com/xHWG8.jpg",
      password: "pw",
      username: "jake",
    });

    expect(result).toEqual({
      headers: authHeaders,
      isAuth: true,
      loggedUser: user,
    });
    expect(mockedApiRequest).toHaveBeenCalledWith({
      data: {
        user: {
          bio: "I work at statefarm",
          email: "jake@jake.jake",
          image: "https://i.stack.imgur.com/xHWG8.jpg",
          password: "pw",
          username: "jake",
        },
      },
      headers: authHeaders,
      method: "PUT",
      url: "/api/user",
    });
    expect(JSON.parse(localStorage.getItem("loggedUser") ?? "")).toEqual(
      result,
    );
  });

  test("resolves undefined and does not touch localStorage when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    const result = await userUpdate({
      headers: authHeaders,
      username: "jake",
    });

    expect(result).toBeUndefined();
    expect(localStorage.getItem("loggedUser")).toBeNull();
  });
});
