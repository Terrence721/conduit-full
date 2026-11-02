import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import Article from "./Article";
import AuthProvider from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import toggleFav from "../../services/toggleFav";
import getUser from "../../services/getUser";

vi.mock("../../services/getArticle");
vi.mock("../../services/toggleFav");
vi.mock("../../services/getUser");

const mockedGetArticle = vi.mocked(getArticle);
const mockedToggleFav = vi.mocked(toggleFav);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/article/dragons"]}>
      <AuthProvider>
        <Routes>
          <Route path="/article/:slug" element={children as ReactNode} />
          <Route path="/not-found" element={<div>not found</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const article = {
  author: {
    bio: "Bio",
    followersCount: 3,
    following: false,
    image: null,
    username: "jake",
  },
  body: "# Hello\n\nworld",
  createdAt: "2024-01-01T00:00:00.000Z",
  description: "desc",
  favorited: false,
  favoritesCount: 2,
  slug: "dragons",
  tagList: ["dragons", "fantasy"],
  title: "Dragons",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("Article route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetArticle.mockReset();
    mockedToggleFav.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  beforeAll(() => {
    window.alert = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  test("shows a loading state then renders the article", async () => {
    mockedGetArticle.mockResolvedValueOnce(article as never);

    render(<Article />, { wrapper: Wrapper });

    expect(screen.getByText("Loading article…")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Dragons" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
    expect(screen.getByText("Save story")).toBeInTheDocument();
  });

  test("navigates to not-found when the article fails to load", async () => {
    mockedGetArticle.mockRejectedValueOnce(new Error("boom"));

    render(<Article />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("not found")).toBeInTheDocument();
    });
  });

  test("navigates to not-found when no article is returned", async () => {
    mockedGetArticle.mockResolvedValueOnce(undefined);

    render(<Article />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("not found")).toBeInTheDocument();
    });
  });

  test("toggles favorite when authenticated", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers: { Authorization: "Token abc123" },
        isAuth: true,
      }),
    );
    mockedGetUser.mockResolvedValue({
      bio: null,
      email: "jake@jake.jake",
      image: null,
      token: "abc123",
      username: "jake",
    });
    mockedGetArticle.mockResolvedValueOnce(article as never);
    mockedToggleFav.mockResolvedValueOnce({
      favorited: true,
      favoritesCount: 3,
    } as never);

    render(<Article />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Save story")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Save story"));

    await waitFor(() => {
      expect(mockedToggleFav).toHaveBeenCalledWith({
        favorited: false,
        headers: { Authorization: "Token abc123" },
        slug: "dragons",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });
  });

  test("does not toggle favorite when not authenticated", async () => {
    const user = userEvent.setup();
    mockedGetArticle.mockResolvedValueOnce(article as never);

    render(<Article />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Save story")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Save story"));

    expect(mockedToggleFav).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
