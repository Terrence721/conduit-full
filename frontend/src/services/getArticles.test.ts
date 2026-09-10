import mockApiRequest from "../testUtils/mockApiRequest";
import getArticles from "./getArticles";

vi.mock("../helpers/apiRequest");

describe("getArticles", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
    mockedApiRequest.mockResolvedValue({ articles: [], articlesCount: 0 });
  });

  test.each([
    {
      location: "global" as const,
      params: {},
      url: "/api/articles?limit=3&&offset=0",
    },
    {
      location: "tag" as const,
      params: { tagName: "react" },
      url: "/api/articles?tag=react&&limit=3&&offset=0",
    },
    {
      location: "profile" as const,
      params: { username: "exampleUser1" },
      url: "/api/articles?author=exampleUser1&&limit=3&&offset=0",
    },
    {
      location: "favorites" as const,
      params: { username: "exampleUser1" },
      url: "/api/articles?favorited=exampleUser1&&limit=3&&offset=0",
    },
    {
      location: "feed" as const,
      params: {},
      url: "/api/articles/feed?limit=3&&offset=0",
    },
  ])("builds the $location URL", async ({ location, params, url }) => {
    await getArticles({ location, ...params });

    expect(mockedApiRequest).toHaveBeenCalledWith({ url, headers: undefined });
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
