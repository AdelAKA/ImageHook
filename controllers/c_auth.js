const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const passport = require('passport')

const displayWelcomePage = (req, res) => {
    res.render('welcome')
}

const displayRegisterPage = (req, res) => {
    res.render('register')
}

const registerAction = async (req, res) => {
    const { username, email, password, password2 } = req.body

    let err = []

    // Check if any of the field is left empty when registering
    if (!username || !email || !password || !password2) {
        err.push({ msg: 'Fill all the fields' })
    }
    if (password !== password2) {
        err.push({ msg: 'Passwords do not match' })
    }
    if (password.length < 6) {
        err.push({ msg: 'Password must be at least 6 charecters' })
    }

    if (err.length > 0) {
        res.render('register', {
            errors: err,
            username,
            email,
        })
    } else {
        // Validation Passed
        try {
            const user = await User.create({ ...req.body })
            req.flash('success_msg', 'You are now registered and can login')
            res.redirect('login')
        } catch (error) {
            err.push({ msg: error.message })
            res.render('register', {
                errors: err,
                username,
                email,
            })
        }
    }
}

const displayLoginPage = (req, res) => {
    res.render('login')
}

const loginAction = (err, req, res, next) => {
    if (err) next(err);
}

module.exports = {
    displayWelcomePage,
    displayRegisterPage,
    registerAction,
    displayLoginPage,
    loginAction
}