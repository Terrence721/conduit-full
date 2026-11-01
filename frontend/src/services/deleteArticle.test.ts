import authHeaders from "../testUtils/authHeaders";
import mockApiRequest from "../testUtils/mockApiRequest";
import deleteArticle from "./deleteArticle";
import type { MessageResponse } from "../types";

vi.mock("../helpers/apiRequest");

describe("deleteArticle", () => {
  const mockedApiRequest = mockApiRequest();

  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  test("returns the message on success", async () => {
    const response = {
      message: { body: ["Article deleted."] },
    } as MessageResponse;
    mockedApiRequest.mockResolvedValueOnce(response);

    const result = await deleteArticle({
      headers: authHeaders,
      slug: "test-slug",
    });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith({
      headers: authHeaders,
      method: "DELETE",
      url: "/api/articles/test-slug",
    });
  });

  test("resolves undefined when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    await expect(
      deleteArticle({ headers: authHeaders, slug: "test-slug" }),
    ).resolves.toBeUndefined();
  });
});
