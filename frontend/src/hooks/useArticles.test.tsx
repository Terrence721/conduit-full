import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import useArticles from "./useArticles";
import AuthProvider from "../context/AuthContext";
import getArticles from "../services/getArticles";
import getUser from "../services/getUser";
import type { Article } from "../types";

vi.mock("../services/getArticles");
vi.mock("../services/getUser");

const mockedGetArticles = vi.mocked(getArticles);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const article = {
  author: { username: "jake" },
  body: "",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "desc",
  favorited: false,
  favoritesCount: 1,
  slug: "slug",
  tagList: [],
  title: "Title",
  updatedAt: "2024-01-01T00:00:00.000Z",
} as unknown as Article;

describe("useArticles", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetArticles.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedGetArticles.mockResolvedValue({
      articles: [article],
      articlesCount: 1,
    });
  });

  test("fetches global articles on mount", async () => {
    const { result } = renderHook(() => useArticles({ location: "global" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockedGetArticles).toHaveBeenCalledWith({
        headers: undefined,
        location: "global",
        tagName: undefined,
        username: undefined,
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.articles).toEqual([article]);
    expect(result.current.articlesCount).toBe(1);
  });

  test("passes auth headers when a user is logged in", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({ headers, isAuth: true }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });

    renderHook(() => useArticles({ location: "feed" }), { wrapper: Wrapper });
    await waitFor(() => {
      expect(mockedGetArticles).toHaveBeenCalledWith({
        headers,
        location: "feed",
        tagName: undefined,
        username: undefined,
      });
    });
  });

  test("does not fetch the feed without auth", async () => {
    renderHook(() => useArticles({ location: "feed" }), { wrapper: Wrapper });

    // Give the effect a chance to run.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedGetArticles).not.toHaveBeenCalled();
  });

  test("forwards tag and username filters", async () => {
    renderHook(
      () =>
        useArticles({
          location: "profile",
          tagName: "dragons",
          username: "jake",
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(mockedGetArticles).toHaveBeenCalledWith({
        headers: undefined,
        location: "profile",
        tagName: "dragons",
        username: "jake",
      });
    });
  });

  test("setArticlesData updates the result", async () => {
    const { result } = renderHook(() => useArticles({ location: "global" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const next = {
      articles: [],
      articlesCount: 0,
    };

    act(() => {
      result.current.setArticlesData(next);
    });

    expect(result.current.articles).toEqual([]);
    expect(result.current.articlesCount).toBe(0);
  });
});
