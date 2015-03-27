var express = require('express');
var router = express.Router();
var passport = require('passport');


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = function () {
    console.log('Initializing index api routing module');

    router.route('/login')
            .post(passport.authenticate('local-login', {
                successRedirect: '/profile', // redirect to the secure profile section
                failureRedirect: '/login', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

    router.route('/signup')
            .post(passport.authenticate('local-signup', {
                successRedirect: '/profile', // redirect to the secure profile section
                failureRedirect: '/signup', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));
    router.route('/logout')
            .get(function (req, res) {
                req.logout();
                res.redirect('/');
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
