import { emptyAuthState, type AuthState } from "../types";
import requireAuth from "./requireAuth";

describe("requireAuth", () => {
  test("returns the auth state unchanged when authenticated", () => {
    const auth: AuthState = {
      headers: { Authorization: "Token fake-token" },
      isAuth: true,
      loggedUser: { ...emptyAuthState.loggedUser, username: "jake" },
    };

    expect(requireAuth(auth)).toBe(auth);
  });

  test("alerts and returns null when not authenticated", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    expect(requireAuth(emptyAuthState)).toBeNull();
    expect(alertSpy).toHaveBeenCalledWith("You need to login first");

    alertSpy.mockRestore();
  });
});
