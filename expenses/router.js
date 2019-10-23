const express = require("express");
const bodyParser = require("body-parser");

const { Expense } = require("./models");
const { User } = require("../users/models");
const passport = require("passport");

const router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate("jwt", { session: false });

const mongoose = require("mongoose");

//view all expenses for a single user
router.get("/user/:id", [jsonParser, jwtAuth], (req, res) => {
    return Expense.find({ user: req.params.id })
        .sort([["_id", -1]])
        .then(expenses => res.status(200).json(expenses))
        .catch(err => res.status(500).json({ message: "Something went terribly wrong!" }));
});

//get the sum of all expenses for one user
router.get("/user_sum/:id", [jsonParser, jwtAuth], (req, res) => {
    return Expense.aggregate([
        {
            $match: { user: new mongoose.Types.ObjectId(req.params.id) },
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount",
                },
            },
        },
    ])
        .then(sum => {
            res.status(200).json(sum);
        })
        .catch(err => res.status(500).json({ message: "Something went terribly wrong!" }));
});

//get the sum of all expenses for all months
router.get("/user_month/:id", [jsonParser, jwtAuth], (req, res) => {
    return Expense.aggregate([
        {
            $match: { user: new mongoose.Types.ObjectId(req.params.id) },
        },
        {
            $project: {
                amount: 1,
                month: { $month: "$expiration" },
            },
        },
        {
            $group: {
                _id: "$month",
                total: {
                    $sum: "$amount",
                },
            },
        },
    ])
        .then(sum => {
            res.status(200).json(sum);
        })
        .catch(err => res.status(500).json({ message: "Something went terribly wrong!" }));
});

//get the sum of all expenses for the current day
let now = Date.now(),
    oneDay = 1000 * 60 * 60 * 24,
    oneWeek = 1000 * 60 * 60 * 24 * 7,
    today = new Date(now - (now % oneDay)),
    tomorrow = new Date(today.valueOf() + oneDay),
    thisWeek = new Date(today.valueOf() - oneWeek);

router.get("/user_current_week/:id", [jsonParser, jwtAuth], (req, res) => {
    Expense.aggregate([
        {
            $match: {
                $and: [
                    { user: new mongoose.Types.ObjectId(req.params.id) },
                    {
                        expiration: {
                            $gte: thisWeek,
                            $lt: today,
                        },
                    },
                ],
            },
        },
        {
            $group: {
                _id: "$month",
                total: {
                    $sum: "$amount",
                },
            },
        },
    ])
        .then(sum => {
            res.status(200).json(sum);
        })
        .catch(err => res.status(500).json({ message: "Something went terribly wrong!" }));
});

//create a new expense
router.post("/", [jsonParser, jwtAuth], (req, res) => {
    User.findOne({ username: req.user.username })
        .then(user => {
            const { expense, expenseType, amount, notes, expiration, status } = req.body;
            Expense.create({
                user: user._id,
                expense: expense,
                expenseType: expenseType,
                notes: notes,
                amount: amount,
                expiration: expiration,
                status: status,
            })
                .then(expense => {
                    return res.status(201).json(expense);
                })
                .catch(err => {
                    return res.status(500).json({ message: "Something went terribly wrong!" });
                });
        })
        .catch(err => {
            return res.status(500).json({ message: "Something went terribly wrong!" });
        });
});



module.exports = { router };
