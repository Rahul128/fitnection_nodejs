const mongoose = require('mongoose');
const dbConnection = require('./connectionDB');
const UserConnection = require('../models/userConnection');

let self = {};

// Adding a connection to user connections
self.addConnectionById = (userId, connectionId, rsvp, cb) => {
    UserConnection.findOneAndUpdate({
        user: userId,
        connection: connectionId
    },
    {
        user: userId,
        connection: connectionId,
        rsvp: rsvp
    },
    {
        upsert: true
    },
    (err, result) => {
        if (err) {
            console.error(err);
            cb(null);
        }
        else cb(result);
    });
};

// Removing a connecton from user connections
self.removeConnectionById = (userId, connectionId, cb) => {
    UserConnection.deleteOne({
        user: userId,
        connection: connectionId
    },
    (err, result) => {
        if (err) {
            console.error(err);
            cb(null);
        }
        else cb(result);
    });
};

// Getting user connections
self.getUserConnections = (userId, cb) => {

        UserConnection
            .aggregate([
                {
                    $match: {
                        user: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        "from": "connections",
                        "localField":"connection",
                        "foreignField":"connectionId",
                        "as":"connection"
                    }
                }
            ],
            (err, result) => {
                if (err) {
                    console.error(err);
                    cb(null);
                }
                else cb(result);
            });
};

module.exports = self;