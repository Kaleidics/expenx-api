const express = require('express');
const bodyParser = require('body-parser');

const { Expense } = require('./models');
const { User } = require('../users/models');
const passport = require('passport');

const router = express.Router();
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });

//view all expenses for a single user
router.get('/user/:id', (req,res) => {
    return Expense.find({ user: req.params.id })
        .sort([["_id", -1]])
        .then(expenses => res.status(200).json(expenses))
        .catch(err => res.status(500).json({ message: "Something went terribly wrong!" }));
});

//create a new expense
router.post('/', [jsonParser, jwtAuth], (req, res) => {
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
                status: status
            })
            .then(expense => {
                return res.status(201).json(expense);
            })
            .catch(err => {
                return res.status(500).json({ message: 'Something went terribly wrong!' });
            });
        })
        .catch(err => {
            return res.status(500).json({ message: 'Something went terribly wrong!' });
        });
});

module.exports = { router };