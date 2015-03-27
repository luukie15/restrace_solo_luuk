var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var bcrypt = require('bcrypt-nodejs');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var googlePlaces = require('googleplaces');
var ConnectRoles = require('connect-roles');

var app = express();

// require db.js
var configDB = require('./config/database.js');

// Connect to db
mongoose.connect(configDB.url);

var user = new ConnectRoles({
    failureHandler: function (req, res, action) {   
        var accept = req.headers.accept || '';
        res.status(403);
        if (~accept.indexOf('html')) { 
            res.render('access-denied',
                {
                    action: action
                });
        } else {
            res.send('Access Denied - You don\'t have permission to: ' + action);
        }
    }
});

/*
 * MODELS HERE
 * */
require('./models/User')(mongoose, bcrypt);
require('./models/Waypoint')(mongoose);
require('./models/Race')(mongoose);

// pass passport for configuration
require('./config/passport')(passport, mongoose);

function handleError(req, res, statusCode, message) {
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
};

// moderator pages,
// dont return false, because else admins couldn't access the page while they need access to all pages
user.use('access private page', function (req) {
    // in the model, the link to a role is from a user object -> local -> role
    // roles are set in robomongo
    if (req.user && req.user.local.role === 'moderator') {
        return true;
    }
});

user.use('access admin page', function (req) {
    if (req.user && req.user.local.role === 'admin') {
        return true;
    } else {
        return false;
    }
});

app.use(user.middleware());

/* 
 * Routes
 * */
var index = require('./routes/index')(handleError, user);
var waypoints = require('./routes/waypoints')(user);
var races = require('./routes/races')(mongoose, handleError, user);

var indexApi = require('./routes/api/index')();
var waypointsApi = require('./routes/api/waypoints')(handleError, googlePlaces);
var racesApi = require('./routes/api/races')(mongoose, handleError, googlePlaces);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: "topsecret"}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', index);
app.use('/waypoints', waypoints);
app.use('/races', races);

app.use('/api/index', indexApi);
app.use('/api/races', racesApi);
app.use('/api/waypoints', waypointsApi);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;