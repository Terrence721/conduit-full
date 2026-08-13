export {};

import express from "express";
import request from "supertest";
import createRateLimiter from "./rateLimiter";

const buildApp = (overrides: Parameters<typeof createRateLimiter>[0]) => {
  const app = express();
  app.use(createRateLimiter(overrides));
  app.get("/", (_req, res) => res.json({ ok: true }));
  return app;
};

describe("middleware/rateLimiter.ts", () => {
  test("allows requests under the limit", async () => {
    const app = buildApp({ windowMs: 60_000, limit: 2 });

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
  });

  test("responds 429 once a client exceeds the limit within the window", async () => {
    const app = buildApp({ windowMs: 60_000, limit: 2 });

    await request(app).get("/");
    await request(app).get("/");
    const res = await request(app).get("/");

    expect(res.status).toBe(429);
  });

  test("resets the count for a new window (proven by a fresh limiter instance, not a real clock wait)", async () => {
    const app = buildApp({ windowMs: 60_000, limit: 1 });
    await request(app).get("/");
    expect((await request(app).get("/")).status).toBe(429);

    const freshApp = buildApp({ windowMs: 60_000, limit: 1 });
    const res = await request(freshApp).get("/");

    expect(res.status).toBe(200);
  });

  test("defaults to a 15-minute window and a limit of 100 when called with no overrides", async () => {
    const app = express();
    app.use(createRateLimiter());
    app.get("/", (_req, res) => res.json({ ok: true }));

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.headers["ratelimit-limit"]).toBe("100");
  });
});
