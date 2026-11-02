import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import ArticlesButtons from "./ArticlesButtons";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";
import toggleFollow from "../../services/toggleFollow";
import toggleFav from "../../services/toggleFav";
import type { Article, Profile } from "../../types";

vi.mock("../../services/getUser");
vi.mock("../../services/toggleFollow");
vi.mock("../../services/toggleFav");

const mockedGetUser = vi.mocked(getUser);
const mockedToggleFollow = vi.mocked(toggleFollow);
const mockedToggleFav = vi.mocked(toggleFav);

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
    mockedToggleFollow.mockReset();
    mockedToggleFav.mockReset();
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

  test("updates the author when follow succeeds", async () => {
    const user = userEvent.setup();
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
    mockedToggleFollow.mockResolvedValue({
      bio: "bio",
      followersCount: 4,
      following: true,
      image: null,
      username: "jake",
    });

    render(
      <Wrapper>
        <ArticlesButtons article={article} setArticle={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /follow/i }),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /follow/i }));

    await waitFor(() => {
      expect(mockedToggleFollow).toHaveBeenCalled();
    });
  });

  test("updates favorite state when favorite succeeds", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
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
    mockedToggleFav.mockResolvedValue({
      ...article,
      favorited: true,
      favoritesCount: 4,
    });

    render(
      <Wrapper>
        <ArticlesButtons article={article} setArticle={() => undefined} />
      </Wrapper>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /favorite/i }),
      ).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    await waitFor(() => {
      expect(mockedToggleFav).toHaveBeenCalled();
    });
  });
});
