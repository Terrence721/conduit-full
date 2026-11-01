import { render, screen } from "@testing-library/react";
import HomeArticles from "./HomeArticles";
import AuthProvider from "../context/AuthContext";
import FeedProvider from "../context/FeedContext";
import useArticles from "../hooks/useArticles";
import getUser from "../services/getUser";
import getTags from "../services/getTags";

vi.mock("../hooks/useArticles");
vi.mock("../services/getUser");
vi.mock("../services/getTags");

const mockedUseArticles = vi.mocked(useArticles);
const mockedGetUser = vi.mocked(getUser);
const mockedGetTags = vi.mocked(getTags);

describe("HomeArticles route", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetUser.mockReset();
    mockedGetUser.mockResolvedValue(undefined);
    mockedGetTags.mockReset();
    mockedGetTags.mockReturnValue(new Promise(() => undefined));
    mockedUseArticles.mockReturnValue({
      articles: [],
      articlesCount: 0,
      loading: false,
      setArticlesData: vi.fn(),
    });
  });

  test("forwards the feed tab to ArticlesListView", () => {
    render(
      <AuthProvider>
        <FeedProvider>
          <HomeArticles />
        </FeedProvider>
      </AuthProvider>,
    );

    expect(mockedUseArticles).toHaveBeenCalledWith(
      expect.objectContaining({ location: "global" }),
    );
    expect(screen.getByText("Articles not available.")).toBeInTheDocument();
  });
});
