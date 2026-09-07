import type { Options, Dialect } from "sequelize";

const VALID_DIALECTS: readonly Dialect[] = [
  "mysql",
  "postgres",
  "sqlite",
  "mariadb",
  "mssql",
  "db2",
  "snowflake",
  "oracle",
];

const parseDialect = (envVarName: string): Dialect => {
  const value = process.env[envVarName];
  if (!VALID_DIALECTS.includes(value as Dialect)) {
    throw new Error(
      `${envVarName} must be one of ${VALID_DIALECTS.join(", ")}, got: ${value}`,
    );
  }
  return value as Dialect;
};

interface RawDbConfig {
  username: string | undefined;
  password: string | undefined;
  database: string | undefined;
  host: string | undefined;
  port: string | undefined;
  dialect: Dialect;
  logging: string | undefined;
}

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

const config: Record<"development" | "test" | "production", Options> = {
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
};

export = config;
