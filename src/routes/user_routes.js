import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

// pull in error types and the logic to handle them and set status codes
import { BadParamsError } from "../lib/custom_errors";

import { user } from "./../db/models";
import checkIsInRole from './../lib/checkIsInRole';
import { ROLES } from "../lib/roles";

import { addToBlackList, checkBlackList } from '../lib/blackListTokens';

// const checkBlackList = checkBlackList();
const tokenAuth = passport.authenticate("jwt", { session: false });
const localAuth = passport.authenticate("local", { session: false });


// instantiate a router (mini app that only handles routes)
const router = express.Router();

router.post("/sign-up", async (req, res, next) => {
    // start a promise chain, so that any errors will pass to `handle`
    Promise.resolve(req.body.credentials)
        .then(credentials => {
            if (
                !credentials ||
                !credentials.password ||
                credentials.password !== credentials.password_confirmation
            ) {
                throw new BadParamsError();
            } else {
                return user.create({
                    name: credentials.name,
                    email: credentials.email,
                    hashedPassword: credentials.password,
                    role: ROLES.User
                })
            }
        })
        .then(user => {
            const payload = {
                id: user.id,
                // email: user.email,
                name: user.name,
                role: user.role,
                expiresIn: process.env.JWT_EXPIRATION_D + "d"
            };

            // assigns payload to req.user
            req.login(payload, { session: false }, error => {
                if (error) {
                    next();
                }

                // generate a signed json web token and return it in the response
                const token = jwt.sign(payload, process.env.PASS_KEY, { expiresIn: process.env.JWT_EXPIRATION_D + "d" });

                // assign our jwt to the cookie
                res
                    .cookie("jwt", token, { httpOnly: true, secure: true, sameSite: 'none' })
                    .status(201)
                    .json({ id: req.user.id, name: req.user.name, role: req.user.role });
            });
        })
        // pass any errors along to the error handler
        .catch(next);
});

router.post("/sign-in", localAuth, async (req, res, next) => {
    if (req.user) {
        // This is what ends up in our JWT
        const payload = {
            id: req.user.id,
            // email: req.user.email,
            name: req.user.name,
            role: req.user.role
        };

        // assigns payload to req.user
        req.login(payload, { session: false }, error => {
            if (error) {
                next();
            }

            // generate a signed json web token and return it in the response
            const token = jwt.sign(payload, process.env.PASS_KEY, { expiresIn: process.env.JWT_EXPIRATION_D + "d" });

            // assign our jwt to the cookie
            res
                .cookie("jwt", token, { httpOnly: true, secure: false })
                .status(200)
                .json({ id: req.user.id, name: req.user.name, role: req.user.role });
        });
    }
});

router.patch("/change-password", tokenAuth, async (req, res, next) => {
    if (!req.body.newPassword) throw new BadParamsError();

    user.findOne({
        where: {
            email: req.user.email
        }
    })
        .then(user => {
            if (user != null) {
                if (user.validPassword(req.body.oldPassword)) {
                    user.bcrypt(req.body.newPassword);

                    res.status(200).json({ msg: "success" });
                } else {
                    throw new BadParamsError();
                }
            } else {
                throw new BadParamsError();
            }
        })
        .catch(next);
});

router.get('/test', tokenAuth, checkBlackList, checkIsInRole(ROLES.Admin, ROLES.User), async (req, res, next) => {
    res.json({ msg: "test" });
})

router.get('/logout', tokenAuth, async (req, res) => {
    // console.log("token", req.cookies.jwt);
    // return res.json({ msg: "test" })
    try {
        await addToBlackList(req.cookies.jwt)
        // await redisClient.LPUSH('token', token);
        return res.status(200).json({
            'status': 200,
            'data': 'You are logged out',
        });
    } catch (error) {
        return res.status(400).json({
            'status': 500,
            'error': error.toString(),
        });
    }
});

export default router;