import authHeaders from "../testUtils/authHeaders";
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
    await getComments({ headers: authHeaders, slug: "test-slug" });

    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      url: "/api/articles/test-slug/comments",
    });
  });
});
