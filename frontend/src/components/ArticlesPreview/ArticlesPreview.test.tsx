import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import ArticlesPreview from "./ArticlesPreview";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";
import toggleFav from "../../services/toggleFav";
import type { Article } from "../../types";

vi.mock("../../services/getUser");
vi.mock("../../services/toggleFav");

const mockedGetUser = vi.mocked(getUser);
const mockedToggleFav = vi.mocked(toggleFav);

const author = {
  bio: null,
  email: "jake@jake.jake",
  followersCount: 0,
  following: false,
  image: null,
  token: "abc123",
  username: "jake",
};

const article = {
  author,
  body: "body",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "desc",
  favorited: false,
  favoritesCount: 3,
  slug: "slug",
  tagList: ["react"],
  title: "Title",
  updatedAt: "2024-01-01T00:00:00.000Z",
} as Article;

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("ArticlesPreview", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedToggleFav.mockReset();
  });

  test("shows the loading text while loading", () => {
    render(
      <Wrapper>
        <ArticlesPreview
          articles={undefined}
          emptyText="No articles"
          loading
          loadingText="Loading..."
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("shows the empty text when there are no articles", () => {
    render(
      <Wrapper>
        <ArticlesPreview
          articles={[]}
          emptyText="No articles"
          loading={false}
          loadingText="Loading..."
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(screen.getByText("No articles")).toBeInTheDocument();
  });

  test("renders article previews", () => {
    render(
      <Wrapper>
        <ArticlesPreview
          articles={[article]}
          emptyText="No articles"
          loading={false}
          loadingText="Loading..."
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /title/i })).toHaveAttribute(
      "href",
      "/article/slug",
    );
  });

  test("renders the empty-tag branch", () => {
    render(
      <Wrapper>
        <ArticlesPreview
          articles={[
            {
              ...article,
              tagList: [],
              body: "",
            },
          ]}
          emptyText="No articles"
          loading={false}
          loadingText="Loading..."
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(screen.getByText("3 min read")).toBeInTheDocument();
    expect(screen.queryByText("react")).not.toBeInTheDocument();
  });

  test("uses the calculated read time for longer articles", () => {
    render(
      <Wrapper>
        <ArticlesPreview
          articles={[
            {
              ...article,
              body: Array(661).fill("word").join(" "),
              tagList: [],
            },
          ]}
          emptyText="No articles"
          loading={false}
          loadingText="Loading..."
          updateArticles={() => undefined}
        />
      </Wrapper>,
    );

    expect(screen.getByText("4 min read")).toBeInTheDocument();
  });

  test("calls updateArticles after a successful favorite", async () => {
    const user = userEvent.setup();
    const updateArticles = vi.fn();
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
        loggedUser: { username: "jake" },
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });
    mockedToggleFav.mockResolvedValue({
      ...article,
      favorited: true,
      favoritesCount: 4,
    });

    render(
      <Wrapper>
        <ArticlesPreview
          articles={[article]}
          emptyText="No articles"
          loading={false}
          loadingText="Loading..."
          updateArticles={updateArticles}
        />
      </Wrapper>,
    );

    const favoriteButton = document.querySelector(
      ".btn-outline-primary",
    ) as HTMLButtonElement;
    await user.click(favoriteButton);

    await waitFor(() => {
      expect(mockedToggleFav).toHaveBeenCalledWith({
        favorited: false,
        headers: { Authorization: "Token abc123" },
        slug: "slug",
      });
    });
    expect(updateArticles).toHaveBeenCalled();
  });
});
