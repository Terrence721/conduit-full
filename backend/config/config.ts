import type { Options, Dialect } from "sequelize";

const VALID_DIALECTS = [
  "mysql",
  "postgres",
  "sqlite",
  "mariadb",
  "mssql",
  "db2",
  "snowflake",
  "oracle",
] as const;

type DbDialectEnvVarName =
  "DEV_DB_DIALECT" | "TEST_DB_DIALECT" | "PROD_DB_DIALECT";

const parseDialect = (envVarName: DbDialectEnvVarName) => {
  const value = process.env[envVarName];
  if (
    typeof value !== "string" ||
    !(VALID_DIALECTS as readonly string[]).includes(value)
  ) {
    throw new Error(
      `${envVarName} must be one of ${VALID_DIALECTS.join(", ")}, got: ${value ?? "undefined"}`,
    );
  }
  return value as Dialect;
};

type RawDbConfig = {
  username: string | undefined;
  password: string | undefined;
  database: string | undefined;
  host: string | undefined;
  port: string | undefined;
  dialect: Dialect;
  logging: string | undefined;
};

// process.env.<NAME> and parseDialect("<NAME>") stay as literal calls at
// each call site below (not built from an interpolated prefix) so that
// config.test.ts's regex-based cross-check against .env.example keeps
// working unmodified -- only the repeated Options shape/transformation
// is deduplicated here, not the env var references themselves.
const buildDbConfig = ({
  username,
  password,
  database,
  host,
  port,
  dialect,
  logging,
}: RawDbConfig): Options => ({
  username,
  password,
  database,
  host,
  port: Number(port),
  dialect,
  logging: logging === "true" ? console.log : false,
});

const config = {
  development: buildDbConfig({
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    port: process.env.DEV_DB_PORT,
    dialect: parseDialect("DEV_DB_DIALECT"),
    logging: process.env.DEV_DB_LOGGING,
  }),
  test: buildDbConfig({
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME,
    port: process.env.TEST_DB_PORT,
    dialect: parseDialect("TEST_DB_DIALECT"),
    logging: process.env.TEST_DB_LOGGING,
  }),
  production: buildDbConfig({
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: parseDialect("PROD_DB_DIALECT"),
    logging: process.env.PROD_DB_LOGGING,
  }),
} satisfies Record<"development" | "test" | "production", Options>;

export = config;
