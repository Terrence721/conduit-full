export {};

import errorHandler from "./errorHandler";
import customErrors from "../helper/customErrors";
const {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  FieldRequiredError,
} = customErrors;

const buildRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("middleware/errorHandler.ts", () => {
  test("responds 401 for UnauthorizedError", () => {
    const res = buildRes();
    const error = new UnauthorizedError();

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: [error.message] },
    });
  });

  test("responds 403 for ForbiddenError", () => {
    const res = buildRes();
    const error = new ForbiddenError("article");

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: [error.message] },
    });
  });

  test("responds 404 for NotFoundError", () => {
    const res = buildRes();
    const error = new NotFoundError("Article");

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: [error.message] },
    });
  });

  test("responds 422 for ValidationError", () => {
    const res = buildRes();
    const error = new ValidationError("bad input");

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      errors: { body: [error.message] },
    });
  });

  test("responds 422 for ValidationError subclasses too (FieldRequiredError)", () => {
    const res = buildRes();
    const error = new FieldRequiredError("email");

    errorHandler(error, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
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
