import "dotenv/config";
import express from "express";
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
    : true;

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins === true ? true : allowedOrigins,
  }),
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? "100kb" }));
app.use("/api", createRateLimiter());

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
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
}

export = app;
