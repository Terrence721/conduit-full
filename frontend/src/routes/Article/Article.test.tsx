import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Article from "./Article";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";

vi.mock("../../services/getUser");
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
};

describe("Article route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("renders the article from route state", () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/article/slug", state: article }]}
      >
        <AuthProvider>
          <Routes>
            <Route path="/article/:slug" element={<Article />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("article body")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  test("renders the author name", () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/article/slug", state: article }]}
      >
        <AuthProvider>
          <Routes>
            <Route path="/article/:slug" element={<Article />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link", { name: "jake" });
    expect(links.length).toBeGreaterThan(0);
  });
});
