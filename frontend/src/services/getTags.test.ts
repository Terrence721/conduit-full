import mockApiRequest from "../testUtils/mockApiRequest";
import getTags from "./getTags";

vi.mock("../helpers/apiRequest");

describe("getTags", () => {
  const mockedApiRequest = mockApiRequest();

  test("returns the tags array on success", async () => {
    mockedApiRequest.mockResolvedValueOnce({ tags: ["react", "typescript"] });

    const result = await getTags();

    expect(result).toEqual(["react", "typescript"]);
    expect(mockedApiRequest).toHaveBeenCalledWith({ url: "/api/tags" });
  });

  test("defaults to an empty array when apiRequest resolves undefined", async () => {
    mockedApiRequest.mockResolvedValueOnce(undefined);

    const result = await getTags();

    expect(result).toEqual([]);
  });
});
