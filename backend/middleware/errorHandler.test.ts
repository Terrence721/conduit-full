export {};

import buildRes from "../testUtils/buildRes";
import errorHandler from "./errorHandler";
import customErrors from "../helper/customErrors";
const {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  FieldRequiredError,
} = customErrors;

describe("middleware/errorHandler.ts", () => {
  test.each([
    { name: "UnauthorizedError", error: new UnauthorizedError(), status: 401 },
    {
      name: "ForbiddenError",
      error: new ForbiddenError("article"),
      status: 403,
    },
    {
      name: "NotFoundError",
      error: new NotFoundError("Article"),
      status: 404,
    },
    {
      name: "ValidationError",
      error: new ValidationError("bad input"),
      status: 422,
    },
    {
      name: "FieldRequiredError (ValidationError subclass)",
      error: new FieldRequiredError("email"),
      status: 422,
    },
  ])("responds $status for $name", ({ error, status }) => {
    const res = buildRes();

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: [error.message] },
    });
  });

  test("responds 500 with a generic message for unexpected errors, not the raw error.message", () => {
    const res = buildRes();
    const error = new Error("connect ECONNREFUSED 127.0.0.1:5432");

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: ["Internal server error"] },
    });
  });

  test("never calls next()", () => {
    const res = buildRes();
    const next = vi.fn();

    errorHandler(new NotFoundError("Article"), {} as any, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
