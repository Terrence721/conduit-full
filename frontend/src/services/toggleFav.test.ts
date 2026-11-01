import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import toggleFav from "./toggleFav";
import type { Article, ArticleResponse } from "../types";

vi.mock("../helpers/apiRequest");

describe("toggleFav", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("unfavorites (DELETE) when already favorited", async () => {
    const article = { slug: "test-slug" } as Article;
    mockedApiRequest.mockResolvedValueOnce({ article } as ArticleResponse);

    const result = await toggleFav({
      favorited: true,
      headers: authHeaders,
      slug: "test-slug",
    });

    expect(result).toEqual(article);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      method: "DELETE",
      url: "/api/articles/test-slug/favorite",
    });
  });

  test("favorites (POST) when not already favorited", async () => {
    const article = { slug: "test-slug" } as Article;
    mockedApiRequest.mockResolvedValueOnce({ article } as ArticleResponse);

    const result = await toggleFav({
      favorited: false,
      headers: authHeaders,
      slug: "test-slug",
    });

    expect(result).toEqual(article);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      method: "POST",
      url: "/api/articles/test-slug/favorite",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      toggleFav({
        favorited: false,
        headers: authHeaders,
        slug: "test-slug",
      }),
    ).resolves.toBeUndefined();
  });
});
