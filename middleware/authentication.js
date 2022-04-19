const jwt = require('jsonwebtoken')
const passport = require('passport')
const { UnauthenticatedError } = require('../errors')

// This method is used as a middleware for the main page route
// the purpose is to check if there's a current authenticated user
// if not then the user will be redirected to the loginpage
const authenticationMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Please log in to view this resoure');
    res.redirect('/api/v1/auth/login');
}

// This is used as a middleware in the login request
// checks if userEmail exists and checks for the password
// and according to the result the path is redirected
// Its main fucntion is located in /config/passport.js 
const authenticateLogin = passport.authenticate("local", {
    successRedirect: "/api/v1/main/index",
    failureRedirect: "/api/v1/auth/login",
    failureFlash: true
})

module.exports = {
    authenticationMiddleware,
    authenticateLogin
}