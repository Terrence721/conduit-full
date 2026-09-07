import type { AxiosError } from "axios";
import apiRequest from "./apiRequest";

const { axiosMock } = vi.hoisted(() => ({ axiosMock: vi.fn() }));

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: Object.assign(axiosMock, {
      isAxiosError: actual.default.isAxiosError,
    }),
  };
});

describe("apiRequest", () => {
  beforeEach(() => {
    axiosMock.mockReset();
  });

  test("returns the response data on success", async () => {
    axiosMock.mockResolvedValueOnce({ data: { hello: "world" } });

    const result = await apiRequest<{ hello: string }>({ url: "/api/test" });

    expect(result).toEqual({ hello: "world" });
    expect(axiosMock).toHaveBeenCalledWith({ url: "/api/test" });
  });

  test("propagates errorHandler's thrown message for a reported status", async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 422,
        data: { errors: { body: ["Title already exists"] } },
      },
    } as AxiosError<{ errors: { body: string[] } }>;
    axiosMock.mockRejectedValueOnce(axiosError);

    await expect(apiRequest({ url: "/api/test" })).rejects.toBe(
      "Title already exists",
    );
  });

  test("returns undefined for a non-axios error instead of throwing", async () => {
    axiosMock.mockRejectedValueOnce(new Error("network down"));

    await expect(apiRequest({ url: "/api/test" })).resolves.toBeUndefined();
  });
});
