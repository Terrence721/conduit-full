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

const config: Record<"development" | "test" | "production", Options> = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    port: Number(process.env.DEV_DB_PORT),
    dialect: parseDialect("DEV_DB_DIALECT"),
    logging: process.env.DEV_DB_LOGGING === "true" ? console.log : false,
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME,
    port: Number(process.env.TEST_DB_PORT),
    dialect: parseDialect("TEST_DB_DIALECT"),
    logging: process.env.TEST_DB_LOGGING === "true" ? console.log : false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: Number(process.env.PROD_DB_PORT),
    dialect: parseDialect("PROD_DB_DIALECT"),
    logging: process.env.PROD_DB_LOGGING === "true" ? console.log : false,
  },
};

export = config;
