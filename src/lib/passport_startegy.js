// Passport Package
import passportJWT from "passport-jwt";
import passportLocal from "passport-local";
import passport from "passport";

import { jwtOptions, localOptions } from "./passport_options";
import { BadCredentialsError, JWTExpiredError } from "../lib/custom_errors";

// user model will be used to set `req.user` in
// authenticated routes
import models from "./../db/models";
const User = models.user;

const JwtStrategy = passportJWT.Strategy; // passport.authenticate('local')
const LocalStrategy = passportLocal.Strategy; // passport.authenticate('jwt')

const localStrategy = new LocalStrategy(
    localOptions,
    (email, password, next) => {
        User.findOne({ where: { email } })
            .then(user => {
                if (user !== null) {
                    if (user.validPassword(password)) {
                        return next(null, user);
                    } else {
                        throw new BadCredentialsError();
                    }
                } else {
                    throw new BadCredentialsError();
                }
            })
            .catch(e => next(e));
    }
);

// This module lets you authenticate endpoints using a JSON web token.
// It is intended to be used to secure RESTful endpoints without sessions.
const jwtStrategy = new JwtStrategy(jwtOptions, (jwtPayload, next) => {
    console.log(jwtPayload.expires);
    if (Date.now() > jwtPayload.expires) {
        throw new JWTExpiredError();
    } else {
        User.findOne({ where: { id: jwtPayload.id } })
            .then(user => {
                if (user !== null) {
                    next(null, user);
                } else {
                    next(null, false);
                }
            })
            .catch(e => next(e));
    }
});

// serialize and deserialize functions are used by passport under
// the hood to determine what `req.user` should be inside routes
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// register this strategy with passport
passport.use(jwtStrategy);
passport.use(localStrategy);
// create a passport middleware based on all the above configuration
export default passport.initialize();