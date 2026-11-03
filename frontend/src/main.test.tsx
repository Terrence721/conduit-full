import { beforeEach, describe, expect, it, vi } from "vitest";

describe("main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("throws when the root element is missing", async () => {
    vi.resetModules();

    await expect(import("./main")).rejects.toThrow("Root element not found");
  });
});
