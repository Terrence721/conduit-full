import type { AxiosError } from "axios";
import errorHandler from "./errorHandler";

describe("Catching errors", () => {
  const statusCodes = [401, 403, 404, 422, 500] as const;

  test.each(statusCodes)(
    "Status %p should throw the extracted error message",
    (status) => {
      const message = `Error ${status}`;
      const resError = {
        isAxiosError: true,
        response: {
          status,
          data: { errors: { body: [message] } },
        },
      } as AxiosError<{ errors: { body: string[] } }>;

      let thrown: unknown;
      try {
        errorHandler(resError);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(message);
    },
  );

  test("silently ignores an error that isn't a real axios error", () => {
    // A plain object shaped like an AxiosError but missing axios's own
    // isAxiosError:true runtime marker -- this is the exact narrowing
    // callers used to do themselves before it moved inside errorHandler,
    // so this proves the guard is still real, not just type-level.
    expect(() =>
      errorHandler({ response: { status: 500, data: {} } }),
    ).not.toThrow();
  });
});
