import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import ArticlesPreview from "./ArticlesPreview";
import AuthProvider from "../../context/AuthContext";
import type { Article } from "../../types";

vi.mock("../../services/getUser");

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
});
