const LocalStrategy = require('passport-local').Strategy;

// Load UserSchema
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email'
            },
            // Function for implementation in LocalStrategy
            (email, password, done) => {
                // Match User
                User.findOne({ email: email })
                    .then(async (user) => {
                        if (!user) {
                            return done(null, false, {
                                message: 'This email is not registered'
                            });
                        }

                        // Match Password - needs (await) or else isPasswordCorrect will be a Promise
                        // and will be true output for the if statment
                        const isPasswordCorrect = await user.comparePassword(password)
                        if (isPasswordCorrect) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password is incorrect' });
                        }
                    })
                    .catch((err) => console.log(err));
            }
        )
    )

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            if (err) {
                return done(err)
            }
            done(null, user)
        })
    })

}
