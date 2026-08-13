export {};

import express from "express";
import request from "supertest";

import testDbModule from "../testUtils/testDb";
const { buildTestDb, installTestDb } = testDbModule;

const loadApp = async (db: any) => {
  installTestDb(db);
  vi.resetModules();
  const router = (await import("./tags")).default;
  const errorHandler = (await import("../middleware/errorHandler")).default;

  const app = express();
  app.use(express.json());
  app.use("/tags", router);
  app.use(errorHandler);
  return app;
};

describe("routes/tags.ts", () => {
  test("GET / returns an empty array when there are no tags", async () => {
    const db = await buildTestDb();
    const app = await loadApp(db);

    const res = await request(app).get("/tags");

    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual([]);
  });

  test("GET / returns tag names as a plain array of strings", async () => {
    const db = await buildTestDb();
    await db.Tag.create({ name: "dragons" });
    await db.Tag.create({ name: "training" });
    const app = await loadApp(db);

    const res = await request(app).get("/tags");

    expect(res.status).toBe(200);
    expect(res.body.tags.sort()).toEqual(["dragons", "training"]);
  });
});
