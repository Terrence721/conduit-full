import { emptyAuthState } from "../types";
import userLogout from "./userLogout";

describe("userLogout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("removes loggedUser from localStorage and returns emptyAuthState", () => {
    localStorage.setItem("loggedUser", JSON.stringify({ isAuth: true }));

    const result = userLogout();

    expect(result).toEqual(emptyAuthState);
    expect(localStorage.getItem("loggedUser")).toBeNull();
  });

  test("returns emptyAuthState even when nothing was stored", () => {
    const result = userLogout();

    expect(result).toEqual(emptyAuthState);
    expect(localStorage.getItem("loggedUser")).toBeNull();
  });
});
