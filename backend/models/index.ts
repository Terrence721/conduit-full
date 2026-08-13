"use strict";

import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const envConfig = config[env as keyof typeof config];
const db: Record<string, any> = {};

const sequelize = new Sequelize(envConfig);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      (file.endsWith(".js") || file.endsWith(".ts")) &&
      !file.endsWith(".test.js") &&
      !file.endsWith(".test.ts") &&
      !file.endsWith(".d.ts")
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export = db;
