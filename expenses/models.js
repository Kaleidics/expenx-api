const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const ExpenseSchema = mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expense: {
        type: String,
        required: true
    },
    expenseType: {
        type: String,
        required: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    }
});

ExpenseSchema.methods.serialize = () => {
    return {
        user: this.user || '',
        createdAt: this.createdAt || '',
        expense: this.expense || '',
        typeExpense: this.typeExpense || '',
        amount: this.amount || '',
        expiration: this.expiration || ''
    }
}

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = { Expense };