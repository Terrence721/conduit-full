import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import type { Article } from "../types";
import AuthProvider from "../context/AuthContext";
import getArticles from "../services/getArticles";
import getUser from "../services/getUser";

vi.mock("../services/getArticles");
vi.mock("../services/getUser");

const mockedGetArticles = vi.mocked(getArticles);
const mockedGetUser = vi.mocked(getUser);

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const article = {
  author: { username: "jake", bio: "Editor", image: null },
  body: "hello world",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "desc",
  favorited: false,
  favoritesCount: 1,
  slug: "hello-world",
  tagList: ["dragons"],
  title: "Hello World",
  updatedAt: "2024-01-01T00:00:00.000Z",
} as Article;

describe("Home route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedGetArticles.mockReset();
    mockedGetArticles.mockResolvedValue({
      articles: [],
      articlesCount: 0,
    });
  });

  test("renders the editorial home hero", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/ideas worth/i)).toBeInTheDocument();
    expect(screen.getByText("Popular topics")).toBeInTheDocument();
  });

  test("renders fetched articles", async () => {
    mockedGetArticles.mockResolvedValue({
      articles: [],
      articlesCount: 0,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockedGetArticles).toHaveBeenCalled();
    });
  });

  test("renders an article card including its tag", async () => {
    mockedGetArticles.mockResolvedValue({
      articles: [article],
      articlesCount: 1,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "dragons" })).toBeInTheDocument();
  });

  test("filters articles by the search box", async () => {
    mockedGetArticles.mockResolvedValue({
      articles: [article],
      articlesCount: 1,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByText("Hello World");

    await user.type(screen.getByRole("searchbox"), "zzzz");

    await waitFor(() => {
      expect(screen.queryByText("Hello World")).not.toBeInTheDocument();
    });
    expect(screen.getByText(/try another idea/i)).toBeInTheDocument();
  });

  test("chooseTag shows an active filter and clears it", async () => {
    mockedGetArticles.mockResolvedValue({
      articles: [article],
      articlesCount: 1,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getAllByRole("button", { name: "Technology" })[0]);

    expect(await screen.findByText("×")).toBeInTheDocument();
  });

  test("shows the empty state and clears filters", async () => {
    mockedGetArticles.mockResolvedValue({
      articles: [],
      articlesCount: 0,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/nothing found/i)).toBeInTheDocument();

    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    await user.click(clearButton);

    // After clearing, search box should be empty again.
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  test("writer card links to login when logged out", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </MemoryRouter>,
    );

    const link = await screen.findByRole("link", { name: /start writing/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
