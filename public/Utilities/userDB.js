const mongoose = require('mongoose');
const User = require('../models/user');

let self = {};

// user object based on email id an password(currently single user!)

self.findUser = (email, cb) => {
    User.findOne({
        email: email
    },
    (err, result) => {
        if (err) {
            console.error(err);
            cb(null);
        }
        else cb(result);
    })
};

module.exports = self;