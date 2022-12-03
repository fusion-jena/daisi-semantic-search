var express = require('express'); 
const dotenv = require('dotenv');
var logger = require('morgan');
var bodyParser = require('body-parser'); 
var Cors = require('cors'); //CORS
var swaggerJSDoc= require('swagger-jsdoc');
var swaggerUi= require('swagger-ui-express');
const axios = require('axios'); //http calls

const app = express();
dotenv.config();

const session = require('express-session')
var memoryStore = new session.MemoryStore();
app.use(session({ secret: 'a633d717-1b6e-4ea2-8b38-4af385b13585', resave: false, saveUninitialized: true, store: memoryStore }));
const keycloak = require('./config/keycloak.config.js').initKeycloak(memoryStore);
app.use(keycloak.middleware({ logout: '/logoff' }));

app.get('/', function(req, res){
   res.send("Server is up!");
});

//start application on port 3000
const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.HOST;

//swagger definition
const swaggerDefinition = {
  info: {
    title: 'GFBio/NFDI4Biodiversity Search API',
    version: '1.0.0',
    description: 'Endpoints for dataset search',
  },
  host: `${HOST}:${PORT}`,
  basePath: '/'
};

//keep each index in a separate module
const options = {
  swaggerDefinition,
  apis: ['gfbio.js', 'biodiv.js','./routes/basket.route.js', './routes/log.route.js']
};

//initialize swagger
const swaggerSpec = swaggerJSDoc(options);

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/*const whitelist = [
  'http://localhost:3031',
  'http://localhost:3000',
  'http://localhost:3003',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};*/



//load swagger, cors and bodyparser
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(Cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

//required for PUT and POST request to ensure that the data posted is
// in json format and has a maximum size
// if larger input data is permitted - adjust size here 
app.use(express.json(
{inflate: true,
  limit: '100kb',
  reviver: null,
  strict: true,
  type: 'application/json',
  verify: undefined
}))

const db = require("./models");

db.sequelize.sync();

require("./routes/basket.route")(app);
require("./routes/log.route")(app);

//gfbio index (elastic search)
var elastic_gfbio = require('./gfbio');

//gfbio index (elastic search)
var elastic_biodiv = require('./biodiv');

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Listening at ${HOST} on port ${PORT}`));

app.use('/gfbio', elastic_gfbio);
app.use('/biodiv', elastic_biodiv);
