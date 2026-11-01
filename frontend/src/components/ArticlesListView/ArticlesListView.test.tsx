import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ArticlesListView from "./ArticlesListView";
import useArticles from "../../hooks/useArticles";
import AuthProvider from "../../context/AuthContext";
import getUser from "../../services/getUser";

vi.mock("../../hooks/useArticles");
vi.mock("../../services/getUser");

const mockedUseArticles = vi.mocked(useArticles);
const mockedGetUser = vi.mocked(getUser);

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("ArticlesListView", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
  });

  test("shows loading text while loading", () => {
    mockedUseArticles.mockReturnValue({
      articles: [],
      articlesCount: 0,
      loading: true,
      setArticlesData: vi.fn(),
    });

    render(
      <Wrapper>
        <ArticlesListView
          emptyText="No articles"
          loadingText="Loading articles..."
          location="global"
        />
      </Wrapper>,
    );

    expect(screen.getByText("Loading articles...")).toBeInTheDocument();
  });

  test("shows empty text when no articles are returned", () => {
    mockedUseArticles.mockReturnValue({
      articles: [],
      articlesCount: 0,
      loading: false,
      setArticlesData: vi.fn(),
    });

    render(
      <Wrapper>
        <ArticlesListView
          emptyText="No articles"
          loadingText="Loading articles..."
          location="global"
        />
      </Wrapper>,
    );

    expect(screen.getByText("No articles")).toBeInTheDocument();
  });

  test("forwards location, tagName and username to useArticles", () => {
    mockedUseArticles.mockReturnValue({
      articles: [],
      articlesCount: 0,
      loading: false,
      setArticlesData: vi.fn(),
    });

    render(
      <Wrapper>
        <ArticlesListView
          emptyText="No articles"
          loadingText="Loading articles..."
          location="profile"
          tagName="dragons"
          username="jake"
        />
      </Wrapper>,
    );

    expect(mockedUseArticles).toHaveBeenCalledWith({
      location: "profile",
      tagName: "dragons",
      username: "jake",
    });
  });
});
