import { render, renderHook, act } from "@testing-library/react";
import FeedProvider, { useFeedContext } from "./FeedContext";
import AuthProvider from "./AuthContext";
import getUser from "../services/getUser";
import type { User } from "../types";

vi.mock("../services/getUser");

const mockedGetUser = vi.mocked(getUser);

describe("useFeedContext", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("throws when used outside a FeedProvider", () => {
    const Probe = () => {
      useFeedContext();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      "useFeedContext must be used within a FeedProvider",
    );
  });

  test("defaults to the global tab when logged out", () => {
    const { result } = renderHook(() => useFeedContext(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <FeedProvider>{children}</FeedProvider>
        </AuthProvider>
      ),
    });

    expect(result.current.tabName).toBe("global");
    expect(result.current.tagName).toBe("");
  });

  test("defaults to the your-feed tab when logged in", () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake" } as User,
      }),
    );
    mockedGetUser.mockResolvedValue({
      username: "jake",
      token: "abc123",
    } as User);

    const { result } = renderHook(() => useFeedContext(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <FeedProvider>{children}</FeedProvider>
        </AuthProvider>
      ),
    });

    expect(result.current.tabName).toBe("feed");
  });

  test("changeTab updates both tabName and tagName", () => {
    const { result } = renderHook(() => useFeedContext(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <FeedProvider>{children}</FeedProvider>
        </AuthProvider>
      ),
    });

    act(() => {
      result.current.changeTab("tag", "dragons");
    });

    expect(result.current.tabName).toBe("tag");
    expect(result.current.tagName).toBe("dragons");
  });
});
