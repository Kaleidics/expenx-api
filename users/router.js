const express = require("express");
const bodyParser = require("body-parser");
const { User } = require("./models");
const router = express.Router();
const jsonParser = bodyParser.json();

// REGISTER NEW USER
router.post("/signup", jsonParser, (req, res) => {
    const requiredFields = ["username", "password", "fullname"];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: "ValidationError",
            message: "Missing field",
            location: missingField
        });
    }

    const stringFields = ["username", "password", "fullname"];
    const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== "string");

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: "ValidationError",
            message: "Incorrect field type: expected string",
            location: nonStringField
        });
    }

    const explicityTrimmedFields = ["username", "password"];
    const nonTrimmedField = explicityTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: "ValidationError",
            message: "Cannot start or end with whitespace",
            location: nonTrimmedField
        });
    }

    let { username, password, fullname } = req.body;

    return User.find({ username })
        .countDocuments()
        .then(count => {
            if (count > 0) {
                // There is an existing user with the same email
                return Promise.reject({
                    code: 422,
                    reason: "ValidationError",
                    message: "Email already taken!",
                    location: "email"
                });
            }
            // If there is no existing user, hash the password
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                fullname
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === "ValidationError") {
                return res.status(err.code).json(err);
            }
            console.log(err);
            res.status(500).json({ code: 500, message: "Something went terribly wrong!" });
        });
});

module.exports = { router };
