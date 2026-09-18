import mockApiRequest from "../testUtils/mockApiRequest";
import getComments from "./getComments";
import type { Comment } from "../types";

vi.mock("../helpers/apiRequest");

describe("getComments", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the comments array on success", async () => {
    const comments = [{ id: 1 }] as Comment[];
    mockedApiRequest.mockResolvedValueOnce({ comments });

    const result = await getComments({ slug: "test-slug" });

    expect(result).toEqual(comments);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: undefined,
      url: "/api/articles/test-slug/comments",
    });
  });

  test("defaults to an empty array when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    const result = await getComments({ slug: "test-slug" });

    expect(result).toEqual([]);
  });

  test("passes headers through when provided", async () => {
    const headers = { Authorization: "Token abc123" };

    await getComments({ headers, slug: "test-slug" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers,
      url: "/api/articles/test-slug/comments",
    });
  });
});
