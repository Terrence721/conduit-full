import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Article from "./Article";
import AuthProvider from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import getUser from "../../services/getUser";
import type { Article as ArticleType } from "../../types";

vi.mock("../../services/getArticle");
vi.mock("../../services/getUser");

const mockedGetArticle = vi.mocked(getArticle);
const mockedGetUser = vi.mocked(getUser);

const article = {
  author: {
    bio: null,
    followersCount: 0,
    following: false,
    image: null,
    username: "jake",
  },
  body: "article body",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "desc",
  favorited: false,
  favoritesCount: 3,
  slug: "slug",
  tagList: ["react"],
  title: "Title",
  updatedAt: "2024-01-01T00:00:00.000Z",
} as ArticleType;

describe("Article route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedGetArticle.mockReset();
    mockedGetArticle.mockResolvedValue(article);
  });

  test("renders the article", async () => {
    render(
      <MemoryRouter initialEntries={["/article/slug"]}>
        <AuthProvider>
          <Routes>
            <Route path="/article/:slug" element={<Article />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Title")).toBeInTheDocument();
    expect(screen.getByText("article body")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  test("renders the author name", async () => {
    render(
      <MemoryRouter initialEntries={["/article/slug"]}>
        <AuthProvider>
          <Routes>
            <Route path="/article/:slug" element={<Article />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "jake", level: 3 }),
    ).toBeInTheDocument();
  });
});
