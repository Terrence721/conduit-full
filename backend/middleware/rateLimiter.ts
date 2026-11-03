import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import type { Options } from "express-rate-limit";
import type { Request } from "express";
import { createHash } from "crypto";

const createRateLimiter = (overrides: Partial<Options> = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    // Per-IP by default; authenticated requests are keyed on a hash of
    // their bearer token so a shared NAT address does not pool distinct
    // users, while a single token cannot rotate IPs to evade the limit.
    keyGenerator: (req: Request) => {
      const auth = req.headers.authorization;
      if (typeof auth === "string" && auth.startsWith("Token ")) {
        const token = auth.slice("Token ".length).trim();
        if (token) {
          return `token:${createHash("sha256").update(token).digest("hex")}`;
        }
      }
      return ipKeyGenerator(req.ip ?? "unknown");
    },
    ...overrides,
  });

export = createRateLimiter;
