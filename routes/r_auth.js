const express = require('express')
const router = express.Router()
const { authenticateLogin } = require('../middleware/authentication')

const {
    displayWelcomePage,
    displayRegisterPage,
    registerAction,
    displayLoginPage,
    loginAction } = require('../controllers/c_auth')

router.route('/welcome').get(displayWelcomePage)
router.route('/register').get(displayRegisterPage).post(registerAction)
router.route('/login').get(displayLoginPage).post(authenticateLogin, loginAction)

module.exports = router