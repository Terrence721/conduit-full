import mockApiRequest from "../testUtils/mockApiRequest";
import getArticles from "./getArticles";

vi.mock("../helpers/apiRequest");

describe("getArticles", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockResolvedValue({ articles: [], articlesCount: 0 });
  });

  test("builds the global feed URL with default limit/page", async () => {
    await getArticles({ location: "global" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      url: "/api/articles?limit=3&&offset=0",
      headers: undefined,
    });
  });

  test("builds the tag URL", async () => {
    await getArticles({ location: "tag", tagName: "react" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      url: "/api/articles?tag=react&&limit=3&&offset=0",
      headers: undefined,
    });
  });

  test("builds the profile (author) URL", async () => {
    await getArticles({ location: "profile", username: "exampleUser1" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      url: "/api/articles?author=exampleUser1&&limit=3&&offset=0",
      headers: undefined,
    });
  });

  test("builds the favorites URL", async () => {
    await getArticles({ location: "favorites", username: "exampleUser1" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      url: "/api/articles?favorited=exampleUser1&&limit=3&&offset=0",
      headers: undefined,
    });
  });

  test("builds the feed URL, which has no author/tag query param", async () => {
    await getArticles({ location: "feed" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      url: "/api/articles/feed?limit=3&&offset=0",
      headers: undefined,
    });
  });

  test("respects custom limit/page and passes headers through", async () => {
    const headers = { Authorization: "Token abc123" };

    await getArticles({ headers, limit: 10, location: "global", page: 2 });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      url: "/api/articles?limit=10&&offset=2",
      headers,
    });
  });

  test("resolves whatever apiRequest resolves, undefined included", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(getArticles({ location: "global" })).resolves.toBeUndefined();
  });
});
