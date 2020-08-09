import express from "express";
import passport from "passport";
import models from "./../db/models";
const tokenAuth = passport.authenticate("jwt", { session: false });
const User = models.user;

// instantiate a router (mini app that only handles routes)
const router = express.Router();

router.get("/example", tokenAuth, (req, res, next) => {
    // start a promise chain, so that any errors will pass to `handle`
});

export default router;