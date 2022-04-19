// The app was built in a MVC (Model View Controller) architectural pattern
// so we have a separate folder for each
// routes folder - handles the route for each request
// controllers folder - has the function that needs to be invoked
// views folder - has the pages that needs to be loaded to the browser in each request

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

// Passport config
require('./config/passport')(passport);

// Express app
const app = express()

// Database
const mongoose = require('mongoose')
const connectDB = require('./db/connect')

// Ejs
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Request method override
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// Body Parser
app.use(express.urlencoded({ extended: false }))

// Static middleware
app.use(express.static('./views'));

// Authentication middleware
const { authenticationMiddleware } = require('./middleware/authentication')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// Middlewares
app.use(express.json())

// Express session
app.use(session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Passport middleware
// note: must be after the passport session
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Variables - needs to be before the routes
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    // passport authentication error
    res.locals.error = req.flash('error');

    next();
})

// Define default route for ejs files
app.locals.mainRoute = '/api/v1'

// routers
const authRouter = require('./routes/r_auth')
const mainRouter = require('./routes/r_main')

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/main', authenticationMiddleware, mainRouter)

// use error handelers middlewar
// - must be after the routes or the errorHandler will take the request and
//   handle it as an error before going through the routes
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000

// Initialize connection
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`Server is listening on port : ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start();
