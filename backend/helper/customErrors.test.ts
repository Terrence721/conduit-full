export {};

import customErrors from "./customErrors";
const {
  AlreadyTakenError,
  FieldRequiredError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = customErrors;

describe("helper/customErrors.ts", () => {
  test("ForbiddenError names the resource the caller isn't the author of", () => {
    const error = new ForbiddenError("article");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ForbiddenError");
    expect(error.message).toBe("You are not the author of this article");
  });

  test("NotFoundError omits the trailing colon/space when no extra message is given", () => {
    const error = new NotFoundError("Article");

    expect(error.name).toBe("NotFoundError");
    expect(error.message).toBe("Article not found");
  });

  test("NotFoundError appends the extra message when given", () => {
    const error = new NotFoundError("Article", "slug=foo");

    expect(error.message).toBe("Article not found: slug=foo");
  });

  test("UnauthorizedError has a fixed message", () => {
    const error = new UnauthorizedError();

    expect(error.name).toBe("UnauthorizedError");
    expect(error.message).toBe("You need to login first!");
  });

  test("FieldRequiredError names the missing field, and is a ValidationError", () => {
    const error = new FieldRequiredError("email");

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe("FieldRequiredError");
    expect(error.message).toBe("email is required");
  });

  test("AlreadyTakenError omits the trailing colon/space when no extra message is given", () => {
    const error = new AlreadyTakenError("Email");

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe("AlreadyTakenError");
    expect(error.message).toBe("Email already exists.");
  });

  test("AlreadyTakenError appends the extra message when given", () => {
    const error = new AlreadyTakenError("Email", "try logging in instead");

    expect(error.message).toBe("Email already exists: try logging in instead.");
  });
});
