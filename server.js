/**
 * Created by OmPrakashSharma on 11-07-2018.
 */
'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var cors = require('cors');
var config = require('./config/config');
var port = config.PORT;

var http = require('http').Server(app);

mongoose.connect(config.MONGO_URI);

mongoose.connection.on('connected', function () {
    console.info('mongoDB connected to server !!');
});

mongoose.connection.on('error', function () {
    console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

mongoose.connection.on('disconnected', function () {
    console.error('MongoDB Disconnected from server !!');
});

// body parser for api and port setting
app.set('port', port);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(__dirname + '/app'));
app.use(cors());

// load all models
var model_files, model_loc;
app.models = {};
model_loc = __dirname + '/app/models';
model_files = fs.readdirSync(model_loc);
model_files.forEach(function (file) {
    return (require(model_loc + '/' + file)).boot(app);
});

// load all controller
var controller_loc = __dirname + '/app/controllers';
var controller_files = fs.readdirSync(controller_loc);
controller_files.forEach(function (file) {
    return (require(controller_loc + '/' + file))(io, app);
});

// load all routes
var routes_loc = __dirname + '/app/routes';
var routes_files = fs.readdirSync(routes_loc);
routes_files.forEach(function (file) {
    return (require(routes_loc + '/' + file))(app);
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

http.listen(port, function () {
    console.log('Server is listening on *:' + port);
});