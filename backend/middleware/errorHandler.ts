import type { Request, Response, NextFunction } from "express";
import customErrors from "../helper/customErrors";

const { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } =
  customErrors;

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = (res.locals?.requestId as string) ?? "unknown";
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      method: req.method,
      path: req.originalUrl,
      requestId,
    }),
  );

  if (error instanceof UnauthorizedError) {
    res.status(401).json({ errors: { body: [error.message] } });
  } else if (error instanceof ForbiddenError) {
    res.status(403).json({ errors: { body: [error.message] } });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ errors: { body: [error.message] } });
  } else if (error instanceof ValidationError) {
    res.status(422).json({ errors: { body: [error.message] } });
  } else {
    res.status(500).json({ errors: { body: ["Internal server error"] } });
  }
};

export = errorHandler;
