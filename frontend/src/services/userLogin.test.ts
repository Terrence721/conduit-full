import mockApiRequest from "../testUtils/mockApiRequest";
import userLogin from "./userLogin";
import type { User } from "../types";

vi.mock("../helpers/apiRequest");

describe("userLogin", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
    localStorage.clear();
  });

  test("builds AuthState, persists it, and returns it on success", async () => {
    const user = { username: "jake", token: "abc123" } as User;
    mockedApiRequest.mockResolvedValueOnce({ user });

    const result = await userLogin({
      email: "jake@jake.jake",
      password: "pw",
    });

    expect(result).toEqual({
      headers: { Authorization: "Token abc123" },
      isAuth: true,
      loggedUser: user,
    });
    expect(mockedApiRequest).toHaveBeenCalledWith({
      data: { user: { email: "jake@jake.jake", password: "pw" } },
      method: "POST",
      url: "/api/users/login",
    });
    expect(JSON.parse(localStorage.getItem("loggedUser") ?? "")).toEqual(
      result,
    );
  });

  test("resolves undefined and does not touch localStorage when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    const result = await userLogin({
      email: "jake@jake.jake",
      password: "wrong",
    });

    expect(result).toBeUndefined();
    expect(localStorage.getItem("loggedUser")).toBeNull();
  });
});
