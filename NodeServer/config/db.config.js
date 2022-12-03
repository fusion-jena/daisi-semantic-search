module.exports = {
    Host: process.env.MySQL_Host,
    Port: process.env.MySQL_Port,
    User: process.env.MySQL_User,
    Password: process.env.MySQL_Password,
    Database: process.env.MySQL_Database,
    Dialect: "mysql",
    Pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };