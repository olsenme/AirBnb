const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql');

const api = require('./api');

const app = express();
const port = '8003';

const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDBName = process.env.MYSQL_DATABASE;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_INITDB_DATABASE;
const mongoUser = process.env.MONGODB_USERNAME;
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`



const maxMySQLConnections = 10;
app.locals.mysqlPool = mysql.createPool({
  connectionLimit: maxMySQLConnections,
  host: mysqlHost,
  port: mysqlPort,
  database: mysqlDBName,
  user: mysqlUser,
  password: mysqlPassword
});


app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));


/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

MongoClient.connect(mongoURL,{ useNewUrlParser: true }, function (err, client) {
  if (!err) {
    app.locals.mongoDB = client.db(mongoDBName);
    app.listen(port, function() {
      console.log("== Server is running on port", port);
    });
  }
});
