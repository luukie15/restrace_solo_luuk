var express = require('express');
var router = express();
var _ = require('underscore');


module.exports = function (user) {
    console.log('Initializing waypoint routing module');

    router.route('/')
            .get(user.can('access admin page'), function (req, res, next) {
                res.render('waypoint_home.ejs');
            });
           
    return router;
    
};
