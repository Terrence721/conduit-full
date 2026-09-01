export {};

import fs from "fs";
import path from "path";

const readEnvExampleKeys = (): string[] => {
  const contents = fs.readFileSync(
    path.join(__dirname, "..", ".env.example"),
    "utf8",
  );
  return contents
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0]);
};

const readConfigEnvVarNames = (): string[] => {
  const contents = fs.readFileSync(path.join(__dirname, "config.ts"), "utf8");
  return [
    ...contents.matchAll(/process\.env\.(\w+)|process\.env\[["'](\w+)["']\]/g),
  ].map((match) => match[1] ?? match[2]);
};

const readParseDialectCallNames = (): string[] => {
  const contents = fs.readFileSync(path.join(__dirname, "config.ts"), "utf8");
  return [...contents.matchAll(/parseDialect\("(\w+)"\)/g)].map(
    (match) => match[1],
  );
};

describe("config/config.ts reads the exact env var names declared in .env.example", () => {
  const envExampleKeys = readEnvExampleKeys();
  const configEnvVarNames = [
    ...readConfigEnvVarNames(),
    ...readParseDialectCallNames(),
  ];
  const dbEnvExampleKeys = envExampleKeys.filter((key) => key.includes("_DB_"));

  test.each(configEnvVarNames)(
    "config.ts's process.env.%s is declared in .env.example",
    (name) => {
      expect(envExampleKeys).toContain(name);
    },
  );

  test.each(dbEnvExampleKeys)(
    ".env.example's %s is read somewhere in config.ts",
    (key) => {
      expect(configEnvVarNames).toContain(key);
    },
  );
});

describe("config/config.ts's dialect validation", () => {
  const ALL_ENV_KEYS = [
    "DEV_DB_USERNAME",
    "DEV_DB_PASSWORD",
    "DEV_DB_NAME",
    "DEV_DB_HOSTNAME",
    "DEV_DB_PORT",
    "DEV_DB_DIALECT",
    "DEV_DB_LOGGING",
    "TEST_DB_USERNAME",
    "TEST_DB_PASSWORD",
    "TEST_DB_NAME",
    "TEST_DB_HOSTNAME",
    "TEST_DB_PORT",
    "TEST_DB_DIALECT",
    "TEST_DB_LOGGING",
    "PROD_DB_USERNAME",
    "PROD_DB_PASSWORD",
    "PROD_DB_NAME",
    "PROD_DB_HOSTNAME",
    "PROD_DB_PORT",
    "PROD_DB_DIALECT",
    "PROD_DB_LOGGING",
  ] as const;

  const stubValidEnv = () => {
    for (const key of ALL_ENV_KEYS) {
      vi.stubEnv(key, key.endsWith("_DIALECT") ? "postgres" : "x");
    }
  };

  const freshConfig = async () => {
    vi.resetModules();
    return (await import("./config")).default;
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("loads successfully and coerces logging when every *_DB_DIALECT is valid", async () => {
    stubValidEnv();
    vi.stubEnv("DEV_DB_LOGGING", "true");

    const config = await freshConfig();

    expect(config.development.dialect).toBe("postgres");
    expect(config.development.logging).toBe(console.log);
    expect(config.test.logging).toBe(false);
  });

  test("throws a clear error when a *_DB_DIALECT is invalid", async () => {
    stubValidEnv();
    vi.stubEnv("TEST_DB_DIALECT", "mysql-typo");

    await expect(freshConfig()).rejects.toThrow(/TEST_DB_DIALECT/);
  });

  test("throws when a *_DB_DIALECT is missing entirely", async () => {
    stubValidEnv();
    vi.stubEnv("PROD_DB_DIALECT", "");

    await expect(freshConfig()).rejects.toThrow(/PROD_DB_DIALECT/);
  });
});
