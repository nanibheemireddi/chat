/*
 * dotenv setup to manage environments
 */
var argv = require('yargs')
    .command('environment', function(yargs) {
        yargs.options({
            location: {
                demand: true,
                alias: 'e',
                type: 'string'
            }
        });
    })
    .help('help')
    .argv;
envFileName = argv.e;
require('dotenv').config({ path: ".env." + envFileName });


/*
 * define all global and local variables
 */
var express = require('express');
var path = require('path');

global.fs = require('fs');
global.app = express();
app.use('/public', express.static(path.join(__dirname, 'public')))
global.bodyParser = require('body-parser');
global.cors = require('cors');
global.router = express.Router();
global.helper = require('./app/helpers/_helpers');
global._mongoose = require('./app/helpers/_mongoose');
var http = require('http').Server(app);
global.io = require('socket.io')(http);
global.moment = require('moment');
// console.log(new Date(), "date");
// console.log(moment.locale(), "moment");
// global.langCode = '';
// global.appMessage = require('./app/helpers/language/' + process.env.MSGLANG + ".msg.js");

global.mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.mongo_server);
mongoose.Promise = require('bluebird');
global.Schema = mongoose.Schema;


var colors = require('colors');
// var settings = require('./config/settings');
global._ = require('lodash');
global.models = require('./app/models/');
global.common = require('./app/common/');
require('./config/error_log_handler.js');
require('./app/mob/socket.ctrl.js');
app.use(bodyParser.json());

/**
 * For validation using middleware
 */
app.options(cors({ origin: '*' }));
app.use(cors({ origin: '*' }));
app.use(function(req, res, next) {
    res.header("Access-Control-Expose-Headers", "x-access-token");
    next();
});
global.auth = require('./app/middleware/auth.js');
app.use(auth('off'));

/*
 * Add Routor
 */
require('./app/route/mobileRoutes');
require('./app/route/webRoutes');
// var http = require('http').Server(app);

http.listen(process.env.NODE_PORT, function() {
    console.log(("Listening on port " + process.env.NODE_PORT).green);
}).on('error', function(e) {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use. Is the server already running?'.red);
    }
});