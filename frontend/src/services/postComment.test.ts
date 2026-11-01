import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import postComment from "./postComment";
import type { Comment } from "../types";

vi.mock("../helpers/apiRequest");

describe("postComment", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the posted comment on success", async () => {
    const comment = { body: "Nice post", id: 1 } as Comment;
    mockedApiRequest.mockResolvedValueOnce({ comment });

    const result = await postComment({
      body: "Nice post",
      headers: authHeaders,
      slug: "test-slug",
    });

    expect(result).toEqual(comment);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      data: { comment: { body: "Nice post" } },
      headers: authHeaders,
      method: "POST",
      url: "/api/articles/test-slug/comments",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      postComment({
        body: "Nice post",
        headers: authHeaders,
        slug: "test-slug",
      }),
    ).resolves.toBeUndefined();
  });
});
