import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import setArticle from "./setArticle";
import type { ArticleResponse } from "../types";

vi.mock("../helpers/apiRequest");

describe("setArticle", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("creates an article (POST) and returns its slug", async () => {
    mockedApiRequest.mockResolvedValueOnce({
      article: { slug: "new-article" },
    } as ArticleResponse);

    const result = await setArticle({
      body: "Body text",
      description: "Description",
      headers: authHeaders,
      tagList: ["react", "redux"],
      title: "New title",
    });

    expect(result).toBe("new-article");
    expect(mockedApiRequest).toHaveBeenCalledWith({
      data: {
        article: {
          body: "Body text",
          description: "Description",
          tagList: ["react", "redux"],
          title: "New title",
        },
      },
      headers: authHeaders,
      method: "POST",
      url: "/api/articles",
    });
  });

  test("updates an article (PUT) and returns its slug", async () => {
    mockedApiRequest.mockResolvedValueOnce({
      article: { slug: "updated-slug" },
    } as ArticleResponse);

    const result = await setArticle({
      body: "Updated body",
      description: "Updated description",
      headers: authHeaders,
      slug: "existing-slug",
      title: "Updated title",
    });

    expect(result).toBe("updated-slug");
    expect(mockedApiRequest).toHaveBeenCalledWith({
      data: {
        article: {
          body: "Updated body",
          description: "Updated description",
          tagList: undefined,
          title: "Updated title",
        },
      },
      headers: authHeaders,
      method: "PUT",
      url: "/api/articles/existing-slug",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      setArticle({
        body: "Body text",
        description: "Description",
        headers: authHeaders,
        title: "New title",
      }),
    ).resolves.toBeUndefined();
  });
});
