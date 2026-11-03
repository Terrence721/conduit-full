import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import path from "path";
import { existsSync, readFileSync } from "fs";
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
import rateLimit from "express-rate-limit";
import createRateLimiter from "./middleware/rateLimiter";
import { ipKeyGenerator } from "express-rate-limit";

const env = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3001;
const { sequelize } = models;

const validateProductionEnv = () => {
  if (env !== "production") return;

  const required = [
    "JWT_KEY",
    "CORS_ORIGIN",
    "PROD_DB_USERNAME",
    "PROD_DB_PASSWORD",
    "PROD_DB_NAME",
    "PROD_DB_HOSTNAME",
    "PROD_DB_PORT",
    "PROD_DB_DIALECT",
  ];
  const missing = required.filter((key) => !process.env[key]);
  const jwtKey = process.env.JWT_KEY;
  if (
    jwtKey === "change-me-in-production" ||
    jwtKey === "supersecretkey_example"
  ) {
    missing.push("JWT_KEY (replace placeholder)");
  }
  if (missing.length) {
    throw new Error(
      `Missing or invalid production environment variables: ${missing.join(", ")}`,
    );
  }
};

const openApiPath = [
  path.join(__dirname, "openapi.yaml"),
  path.join(__dirname, "..", "openapi.yaml"),
].find((candidate) => existsSync(candidate));
if (!openApiPath) throw new Error("openapi.yaml not found");
const openApiSpec = readFileSync(openApiPath, "utf8");

// Minimal, dependency-free Prometheus-style counters. They are process-local
// and reset on restart, which is sufficient for a single-instance deployment.
const metrics = { httpRequestsTotal: 0, http5xxTotal: 0 };

const allowedOrigins =
  env === "production"
    ? (process.env.CORS_ORIGIN ?? "").split(",").filter(Boolean)
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

const app = express();
// Behind a load balancer / reverse proxy, trust the forwarded client IP
// so rate limiting and any IP-based logic key on the real client.
if (env === "production") {
  app.set("trust proxy", process.env.TRUST_PROXY ?? 1);
}

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? "100kb" }));
// Attach a request id (honoring an inbound one) to every request for
// traceability, and emit a structured access log line on completion.
app.use((req, res, next) => {
  const incoming = req.get("x-request-id");
  const requestId =
    incoming && incoming.trim() ? incoming.trim() : randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        durationMs: Date.now() - startedAt,
        method: req.method,
        path: req.originalUrl,
        requestId,
        status: res.statusCode,
      }),
    );
  });
  next();
});

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
// General (coarser) rate limit on all other entry points, including file
// serving and documentation, to avoid missing-rate-limiting findings and DoS.
app.use(createRateLimiter());

// Count completed requests for the /metrics endpoint.
app.use((req, res, next) => {
  res.on("finish", () => {
    metrics.httpRequestsTotal += 1;
    if (res.statusCode >= 500) metrics.http5xxTotal += 1;
  });
  next();
});

// API documentation (OpenAPI spec + Swagger UI, loaded from CDN so no
// extra dependency is required).
app.get(
  "/openapi.yaml",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  (_req, res) => res.type("text/yaml").send(openApiSpec),
);

app.get("/api-docs", (_req, res) => {
  const nonce = randomUUID().replace(/-/g, "");
  res.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; frame-ancestors 'none'; object-src 'none'; base-uri 'self'`,
  );
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Conduit API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script nonce="${nonce}">
      SwaggerUIBundle({ url: "/openapi.yaml", dom_id: "#swagger-ui" });
    </script>
  </body>
</html>`);
});

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

app.get(
  "/readyz",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  async (_req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ status: "ready" });
    } catch {
      res.status(503).json({ errors: { body: ["Database unavailable"] } });
    }
  },
);

app.get("/metrics", (_req, res) => {
  res.type("text/plain").send(
    `# HELP conduit_http_requests_total Total HTTP requests handled.
` +
      `# TYPE conduit_http_requests_total counter
` +
      `conduit_http_requests_total ${metrics.httpRequestsTotal}
` +
      `# HELP conduit_http_5xx_total Total HTTP 5xx responses.
` +
      `# TYPE conduit_http_5xx_total counter
` +
      `conduit_http_5xx_total ${metrics.http5xxTotal}
`,
  );
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
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
    express.static(frontendDist, {
      immutable: true,
      index: false,
      maxAge: "1y",
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
    (_req, res) => {
      res.set("Cache-Control", "no-cache");
      res.sendFile(path.join(frontendDist, "index.html"));
    },
  );
} else {
  app.use((_req, res) => {
    res.status(404).json({ errors: { body: ["Not found"] } });
  });
}
app.use(errorHandler);

if (require.main === module) {
  validateProductionEnv();

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
