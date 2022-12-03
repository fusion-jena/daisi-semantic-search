var session = require('express-session');
var Keycloak = require('keycloak-connect');

let _keycloak;

var keycloakConfig = {
    clientId: process.env.Keycloak_ClientId,
    bearerOnly: process.env.Keycloak_BearerOnly,
    serverUrl: process.env.Keycloak_ServerUrl,
    realm: process.env.Keycloak_Realm,
    credentials: {
        secret: process.env.Keycloak_Secret
    }
};

function initKeycloak(memoryStore) { 
    if (_keycloak) { 
        console.warn("Trying to init Keycloak again!"); 
        return _keycloak; 
    } else { 
        console.log("Initializing Keycloak..."); 
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig); 
        return _keycloak; 
    } 
}

function getKeycloak() {
    if (!_keycloak) {
        console.error('Keycloak has not been initialized. Please called init first.');
    }
    return _keycloak;
}

module.exports = {
    initKeycloak,
    getKeycloak
};