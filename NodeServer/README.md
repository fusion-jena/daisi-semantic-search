# Dataset Search - Node Server (Backend)

The Node Server serves as middleware to handle requests from the search index and to provide an API for frontend developers. 
We provide the code for an elasticsearch index in the scope of the [GFBio project](https://www.gfbio.org) and a [GATE Mímir](https://github.com/GateNLP/mimir) index as extension for a semantic search

## Prerequisites

### NodeJS
You need to install [NodeJS](https://nodejs.org/en/) on your machine. NodeJS requires a [package manager](https://nodejs.org/en/download/package-manager/).
<Dataset Search UI> was developed and tested with NodeJS v14.15.4 under Windows 10 and Ubuntu 18.
Check your node version with ```node -v```

### XAMPP/ MySQL

You need to setup a DB to save dataset baskets. For development purposes XAMPP is sufficient, for production consider a real DB, e.g., MySQL. In the default settings, the system assumes to access a database called 'gfbio'. However, you can edit the DB name and the credentials in the .env file.

Create a new DB in your database system and run the statement provided in 'table.txt' to create the necessary table. Configure the .env file with your DB settings.
Settings

All server settings need to be listed in a file called '.env'. Inside the 'NodeServer' folder, create a file '.env' and add the settings provided in '.env.example':


## Installation and Start

Install all necessary dependencies: Navigate to the Node server folder and run

```npm install```

If there are no conflicts, start the server with

 ```node app```
 
The server now is accessible under http://localhost:3000. A swagger documentation describing all request is available under http://localhost:3000/api-docs.


## Settings

Change the port in the app.js file

The search index can be configured inside the modules, gfbio.js for the elasticsearch index and biodiv.js for the GATE Mímir index.


