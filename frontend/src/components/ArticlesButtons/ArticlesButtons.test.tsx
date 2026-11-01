import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import ArticlesButtons from "./ArticlesButtons";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";
import type { Article, Profile } from "../../types";

vi.mock("../../services/getUser");

const mockedGetUser = vi.mocked(getUser);

const profile: Profile = {
  bio: null,
  followersCount: 0,
  following: false,
  image: null,
  username: "jake",
};

const article: Article = {
  author: profile,
  body: "body",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "desc",
  favorited: false,
  favoritesCount: 3,
  slug: "slug",
  tagList: [],
  title: "title",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("ArticlesButtons", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders follow and favorite controls for another user", () => {
    render(
      <Wrapper>
        <ArticlesButtons article={article} setArticle={() => undefined} />
      </Wrapper>,
    );

    expect(
      screen.getByRole("button", { name: /followers/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /favorite/i }),
    ).toBeInTheDocument();
  });

  test("renders author controls when the viewer is the author", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jake", token: "abc123" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });

    render(
      <Wrapper>
        <ArticlesButtons article={article} setArticle={() => undefined} />
      </Wrapper>,
    );

    expect(
      screen.getByRole("button", { name: /delete article/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /edit article/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /followers/i }),
    ).not.toBeInTheDocument();
  });

  test("renders follow and favorite controls for a different authenticated user", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
        isAuth: true,
        loggedUser: { username: "jane", token: "abc" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jane@jane.jane",
      image: null,
      token: "abc",
      username: "jane",
    });

    render(
      <Wrapper>
        <ArticlesButtons article={article} setArticle={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /follow/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /favorite/i }),
    ).toBeInTheDocument();
  });
});
