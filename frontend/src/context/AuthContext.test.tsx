import { act, render, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import getUser from "../services/getUser";
import AuthProvider, { useAuth } from "./AuthContext";
import type { AuthState, User } from "../types";
import { emptyAuthState } from "../types";

vi.mock("../services/getUser");

const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("throws when used outside an AuthProvider", () => {
    const Probe = () => {
      useAuth();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  test("starts from empty state when nothing is stored", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current.isAuth).toBe(false);
    expect(result.current.headers).toBeUndefined();
  });

  test("hydrates from localStorage", () => {
    const stored: AuthState = {
      headers: { Authorization: "Token abc123" },
      isAuth: true,
      loggedUser: { username: "jake" } as User,
    };
    localStorage.setItem("loggedUser", JSON.stringify(stored));

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current).toMatchObject(stored);
  });

  test("falls back to empty state when stored JSON is invalid", () => {
    localStorage.setItem("loggedUser", "{not-json");

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current).toMatchObject(emptyAuthState);
  });

  test("fetches the current user when headers are present", async () => {
    const user = { username: "jake", token: "abc123" } as User;
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({ headers, isAuth: true }),
    );

    mockedGetUser.mockResolvedValueOnce(user);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loggedUser).toEqual(user);
    });
    expect(mockedGetUser).toHaveBeenCalledWith({ headers });
  });

  test("does not update state when getUser resolves undefined", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({ headers, isAuth: true }),
    );

    mockedGetUser.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(mockedGetUser).toHaveBeenCalledWith({ headers });
    });
    // Give the resolved promise a chance to run.
    await Promise.resolve();
    expect(result.current.loggedUser).toBeUndefined();
  });

  test("setAuthState updates the value and persists via caller", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    act(() => {
      result.current.setAuthState({
        headers: { Authorization: "Token xyz" },
        isAuth: true,
        loggedUser: { username: "jane" } as User,
      });
    });

    expect(result.current.isAuth).toBe(true);
    expect(result.current.headers).toEqual({ Authorization: "Token xyz" });
  });
});
