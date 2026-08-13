"use strict";

import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config";
import defineUser from "./User";
import defineArticle from "./Article";
import defineComment from "./Comment";
import defineTag from "./Tag";

const env = process.env.NODE_ENV || "development";
const envConfig = config[env as keyof typeof config];
const db: Record<string, any> = {};

const sequelize = new Sequelize(envConfig);

for (const defineModel of [
  defineUser,
  defineArticle,
  defineComment,
  defineTag,
]) {
  const model = defineModel(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export = db;
