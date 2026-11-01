import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import ArticleAuthorButtons from "./ArticleAuthorButtons";
import AuthProvider from "../../context/AuthContext";
import deleteArticle from "../../services/deleteArticle";
import getUser from "../../services/getUser";
import type { Article, User } from "../../types";

vi.mock("../../services/deleteArticle");
vi.mock("../../services/getUser");

const mockedDeleteArticle = vi.mocked(deleteArticle);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({
  children,
  initialEntries = ["/"],
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

const article = {
  body: "body",
  description: "desc",
  slug: "slug",
  tagList: ["t"],
  title: "title",
} as Article;

describe("ArticleAuthorButtons", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedDeleteArticle.mockReset();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders the delete and edit controls", () => {
    render(
      <Wrapper>
        <ArticleAuthorButtons {...article} />
      </Wrapper>,
    );

    expect(
      screen.getByRole("button", { name: /delete article/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit article/i })).toHaveAttribute(
      "href",
      "/editor/slug",
    );
  });

  test("does not delete when confirmation is declined", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
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
    } as User);

    render(
      <Wrapper initialEntries={["/article/slug"]}>
        <ArticleAuthorButtons {...article} />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete article/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedDeleteArticle).not.toHaveBeenCalled();
  });

  test("deletes and navigates home when confirmed", async () => {
    const headers = { Authorization: "Token abc123" };
    localStorage.setItem(
      "loggedUser",
      JSON.stringify({
        headers,
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
    } as User);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDeleteArticle.mockResolvedValueOnce(undefined);

    render(
      <Wrapper initialEntries={["/article/slug"]}>
        <Routes>
          <Route
            path="/article/slug"
            element={<ArticleAuthorButtons {...article} />}
          />
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete article/i }));

    await waitFor(() => {
      expect(mockedDeleteArticle).toHaveBeenCalledWith({
        headers,
        slug: "slug",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("home")).toBeInTheDocument();
    });
  });

  test("requires authentication before deleting", () => {
    render(
      <Wrapper>
        <ArticleAuthorButtons {...article} />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /delete article/i }));

    expect(window.alert).toHaveBeenCalled();
    expect(mockedDeleteArticle).not.toHaveBeenCalled();
  });
});
