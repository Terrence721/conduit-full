import rateLimit from "express-rate-limit";
import type { Options } from "express-rate-limit";

const createRateLimiter = (overrides: Partial<Options> = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    ...overrides,
  });

export = createRateLimiter;
