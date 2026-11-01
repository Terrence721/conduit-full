import mockApiRequest from "../testUtils/mockApiRequest";
import userSignUp from "./userSignUp";
import type { User } from "../types";

vi.mock("../helpers/apiRequest");

describe("userSignUp", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
    localStorage.clear();
  });

  test("builds AuthState, persists it, and returns it on success", async () => {
    const user = { username: "jake", token: "abc123" } as User;
    mockedApiRequest.mockResolvedValueOnce({ user });

    const result = await userSignUp({
      email: "jake@jake.jake",
      password: "pw",
      username: "jake",
    });

    expect(result).toEqual({
      headers: { Authorization: "Token abc123" },
      isAuth: true,
      loggedUser: user,
    });
    expect(mockedApiRequest).toHaveBeenCalledWith({
      data: {
        user: { email: "jake@jake.jake", password: "pw", username: "jake" },
      },
      method: "POST",
      url: "/api/users",
    });
    expect(JSON.parse(localStorage.getItem("loggedUser") ?? "")).toEqual(
      result,
    );
  });

  test("resolves undefined and does not touch localStorage when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    const result = await userSignUp({
      email: "jake@jake.jake",
      password: "pw",
      username: "jake",
    });

    expect(result).toBeUndefined();
    expect(localStorage.getItem("loggedUser")).toBeNull();
  });
});
