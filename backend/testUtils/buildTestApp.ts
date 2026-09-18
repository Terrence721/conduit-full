import express, { type ErrorRequestHandler, type Router } from "express";

const buildTestApp = (
  router: Router,
  errorHandler: ErrorRequestHandler,
  mountPath: string,
) => {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  app.use(errorHandler);
  return app;
};

export = buildTestApp;
