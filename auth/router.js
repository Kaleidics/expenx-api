const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const config = require("../config");
const router = express.Router();

const createAuthToken = function(user, body) {
    return jwt.sign({ user }, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: body.persistSignIn ? config.JWT_EXPIRY_EXTEND : config.JWT_EXPIRY,
        algorithm: "HS256"
    });
};

const localAuth = passport.authenticate("local", { session: false });

router.use(bodyParser.json());

router.post("/signin", localAuth, (req, res) => {
    console.log(req.body.persistSignIn);
    const authToken = createAuthToken(req.user.serialize(), req.body);
    res.json({ authtoken: authToken, userid: req.user._id });
});

const jwtAuth = passport.authenticate("jwt", { session: false });

// The user exchanges a valid JWT for a new one with a later expiration
router.post("/refresh", jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user, req.body);
    res.status(201).json({ authToken });
});

module.exports = { router };
