const fs = require("fs");
const path = require("path");

const readEnvExampleKeys = () => {
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

const readConfigEnvVarNames = () => {
  const contents = fs.readFileSync(path.join(__dirname, "config.js"), "utf8");
  return [...contents.matchAll(/process\.env\.(\w+)/g)].map(
    (match) => match[1],
  );
};

describe("config/config.js reads the exact env var names declared in .env.example", () => {
  const envExampleKeys = readEnvExampleKeys();
  const configEnvVarNames = readConfigEnvVarNames();
  const dbEnvExampleKeys = envExampleKeys.filter((key) => key.includes("_DB_"));

  test.each(configEnvVarNames)(
    "config.js's process.env.%s is declared in .env.example",
    (name) => {
      expect(envExampleKeys).toContain(name);
    },
  );

  test.each(dbEnvExampleKeys)(
    ".env.example's %s is read somewhere in config.js",
    (key) => {
      expect(configEnvVarNames).toContain(key);
    },
  );
});
