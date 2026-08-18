import type { AxiosError } from "axios";
import errorHandler from "./errorHandler";

describe("Catching errors", () => {
  const statusCodes = [401, 403, 404, 422, 500] as const;

  test.each(statusCodes)(
    "Status %p should throw the extracted error message",
    (status) => {
      const message = `Error ${status}`;
      const resError = {
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
});
