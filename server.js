require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");

const { router: usersRouter } = require("./users");
const { router: expensesRouter } = require('./expenses');
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");

const app = express();

//CORS
app.use(cors());

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/users/", usersRouter);
app.use("/auth/", authRouter);
app.use("/expenses/", expensesRouter);

app.use("/", (req, res) => {
    return res.status(200).json({ message: "hello" });
});

app.use("*", (req, res) => {
    return res.status(404).json({ message: "Not Found" });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect(DATABASE_URL, { useCreateIndex: true, useNewUrlParser: true }, err => {
            if (err) {
                return reject(err);
            }
            server = app
                .listen(PORT, () => {
                    console.log(`Your app is listening on port ${PORT}`);
                    resolve();
                })
                .on("error", err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
