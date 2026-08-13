class MyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ForbiddenError extends MyError {
  constructor(message: string) {
    super(`You are not the author of this ${message}`);
  }
}
class NotFoundError extends MyError {
  constructor(property: string, message = "") {
    super(`${property} not found${message ? `: ${message}` : ""}`);
  }
}
class UnauthorizedError extends MyError {
  constructor() {
    super("You need to login first!");
  }
}

class ValidationError extends MyError {}

class FieldRequiredError extends ValidationError {
  constructor(field: string) {
    super(`${field} is required`);
  }
}

class AlreadyTakenError extends ValidationError {
  constructor(property: string, message = "") {
    super(`${property} already exists${message ? `: ${message}` : ""}.`);
  }
}

export = {
  AlreadyTakenError,
  FieldRequiredError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
};
