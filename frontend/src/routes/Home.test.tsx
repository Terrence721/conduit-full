import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import AuthProvider from "../context/AuthContext";
import getArticles from "../services/getArticles";
import getUser from "../services/getUser";

vi.mock("../services/getArticles");
vi.mock("../services/getUser");

const mockedGetArticles = vi.mocked(getArticles);
const mockedGetUser = vi.mocked(getUser);

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
});
