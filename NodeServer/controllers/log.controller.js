const db = require("../models");
const Logger = db.baskets;
const Op = db.Sequelize.Op;

var fs = require("fs");

// Create
exports.write = (req, res) => {
  // const content = '[ ' + new Date() + '] Some content! ' + req.ip + ' \n';
  // fs.writeFile('./test.txt', content, { flag: 'a+' }, err => {});
  var message = JSON.stringify(req.body) + '\n';
  console.log('Message: '+message);
  fs.writeFile('./log.txt', message, { flag: 'a+' }, err => {});

  res.status(200).send();
};