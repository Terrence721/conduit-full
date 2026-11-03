import "dotenv/config";
import express from "express";
import path from "path";
import type { Server } from "http";
import cors from "cors";
import helmet from "helmet";

import usersRoutes from "./routes/users";
import userRoutes from "./routes/user";
import articlesRoutes from "./routes/articles";
import profilesRoutes from "./routes/profiles";
import tagsRoutes from "./routes/tags";
import models from "./models";
import errorHandler from "./middleware/errorHandler";
import createRateLimiter from "./middleware/rateLimiter";
import { ipKeyGenerator } from "express-rate-limit";

const env = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const { sequelize } = models;

const allowedOrigins =
  env === "production"
    ? (process.env.CORS_ORIGIN ?? "").split(",").filter(Boolean)
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? "100kb" }));
// Stricter, IP-keyed limit on the login endpoint to slow brute-force
// attempts; runs before the global /api limiter.
app.use(
  "/api/users/login",
  createRateLimiter({
    limit: 10,
    keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
  }),
);

app.use("/api", createRateLimiter());

// API documentation (OpenAPI spec + Swagger UI, loaded from CDN so no
// extra dependency is required).
app.get("/openapi.yaml", (_req, res) =>
  res.sendFile(path.join(__dirname, "openapi.yaml")),
);

app.get("/api-docs", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Conduit API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: "/openapi.yaml", dom_id: "#swagger-ui" });
    </script>
  </body>
</html>`);
});

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

app.get("/readyz", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ errors: { body: ["Database unavailable"] } });
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connection with ${env} database has been established.`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

if (process.env.NODE_ENV !== "production") {
  app.get("/", (_req, res) => res.json({ status: "API is running on /api" }));
}
app.use("/api/users", usersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/tags", tagsRoutes);
// Unknown API routes keep the JSON 404 contract; everything else falls back
// to the SPA so deep links / client-side routes resolve correctly.
app.use("/api", (_req, res) => {
  res.status(404).json({ errors: { body: ["Not found"] } });
});

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ errors: { body: ["Not found"] } });
  });
}
app.use(errorHandler);

if (require.main === module) {
  const server: Server = app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully.`);
    server.close(async () => {
      try {
        await sequelize.close();
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export = app;
