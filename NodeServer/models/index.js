const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.Database, dbConfig.User, dbConfig.Password, {
  host: dbConfig.Host,
  port: dbConfig.Port,
  dialect: dbConfig.Dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.Pool.max,
    min: dbConfig.Pool.min,
    acquire: dbConfig.Pool.acquire,
    idle: dbConfig.Pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.baskets = require("./basket.model.js")(sequelize, Sequelize);

module.exports = db;