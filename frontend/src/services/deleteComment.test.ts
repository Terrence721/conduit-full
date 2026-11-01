import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import deleteComment from "./deleteComment";
import type { MessageResponse } from "../types";

vi.mock("../helpers/apiRequest");

describe("deleteComment", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the message on success", async () => {
    const response = { message: "Comment deleted." } as MessageResponse;
    mockedApiRequest.mockResolvedValueOnce(response);

    const result = await deleteComment({
      commentId: 42,
      headers: authHeaders,
      slug: "test-slug",
    });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      method: "DELETE",
      url: "/api/articles/test-slug/comments/42",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      deleteComment({
        commentId: 42,
        headers: authHeaders,
        slug: "test-slug",
      }),
    ).resolves.toBeUndefined();
  });
});
