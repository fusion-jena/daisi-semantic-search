module.exports = app => {
    const log = require("../controllers/log.controller.js");
    const keycloak = require('../config/keycloak.config.js').getKeycloak();

    var router = require("express").Router();
  
   router.post("/", log.write);
  
   app.use('/api/log', router);
  };