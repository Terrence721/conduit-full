const {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = require("../helper/customErrors");

const errorHandler = (error, req, res, _next) => {
  console.log("\x1b[31m%s\x1b[0m", "▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼");
  console.log(error);

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

  console.log("\x1b[31m%s\x1b[0m", "▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲");
};

module.exports = errorHandler;
