import "dotenv/config";
import express from "express";
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
app.use("/api", createRateLimiter());

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

app.get("/readyz", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ready" });
  } catch (error) {
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

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../frontend/dist"));
} else {
  app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
}
app.use("/api/users", usersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/tags", tagsRoutes);
app.all("/*any", (req, res) =>
  res.status(404).json({ errors: { body: ["Not found"] } }),
);
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
