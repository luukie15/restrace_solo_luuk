var express = require('express');
var router = express.Router();
var handleError;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = function (errCallback, user) {
    console.log('Initializing index routing module');
    handleError = errCallback;

    /* GET home page. */
    router.route('/')
            .get(function (req, res, next) {
                res.render('index');
            });

    router.route('/login')
            .get(function (req, res, next) {
                res.render('login', {message: req.flash('loginMessage')});
            });

    router.route('/signup')
            .get(function (req, res) {
                res.render('signup', {message: req.flash('signupMessage')});
            });
            
    router.route('/profile')
            .get(isLoggedIn, function (req, res) {
                var adminButtons;
                if(typeof req.user.local.role === 'undefined'){
                    req.user.local.role = 'Geen rol';
                }
                if(req.user.local.role == "admin"){
                    adminButtons = "<a href='/logout' class='btn btn-default btn-sm'>Log uit</a>"; 
                }else{
                    adminButtons = "";
                }
                res.render('profile', {
                    user: req.user //from session
                });
            });
            
    return router;
};

/** CODE TO SET ROLE ACCESS
 *    router.route('/profile')
            .get(user.can('access admin page'), function (req, res) {
                res.render('profile.ejs', {
                    user: req.user //from session
                });
            }); 
 * 
 **/
