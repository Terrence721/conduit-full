import mockApiRequest from "../testUtils/mockApiRequest";
import getArticle from "./getArticle";
import type { Article } from "../types";

vi.mock("../helpers/apiRequest");

describe("getArticle", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the article on success", async () => {
    const article = { slug: "test-slug" } as Article;
    mockedApiRequest.mockResolvedValueOnce({ article });

    const result = await getArticle({ slug: "test-slug" });

    expect(result).toEqual(article);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: undefined,
      url: "/api/articles/test-slug",
    });
  });

  test("passes headers through when provided", async () => {
    const headers = { Authorization: "Token abc123" };

    await getArticle({ headers, slug: "test-slug" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers,
      url: "/api/articles/test-slug",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(getArticle({ slug: "test-slug" })).resolves.toBeUndefined();
  });
});
