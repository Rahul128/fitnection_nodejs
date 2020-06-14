const Connection = require('../models/connection');

let self = {};

// To fetch the connections grouped by category
self.getConnectionsGroupedByCategory = (cb) => {

    // To group the connections by categories
    Connection.aggregate(
        [
            {
                $match: {}
            },
            {
                $group: {
                    _id: "$connectionCategory",
                    "connections": {
                        $push: "$$ROOT"
                    },
                    "count": {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    "connectionCategory": "$_id",
                    "connections": 1,
                    "count" : 1
                }
            }
        ], (err, result) => {
            if (err) {
                console.error(err);
                cb(null);
            }
            else cb(result);
        }
    )
}


self.getConnectionById = (connectionId, cb) => {
    Connection.findOne({connectionId: connectionId}, (err, result) => {
        if (err) {
            console.error(err);
            cb(null);
        }
        else cb(result);
    })
}

self.saveConnection = (connection, cb) => {

    Connection.init();

    var connection = new Connection({
        connectionName: connection.name, 
        connectionCategory: connection.topic, 
        details: connection.details,
        date: connection.when, 
        thumbnail: 'default.jpg', 
        location: connection.where 
    });

    connection.save((err, result) => {
        if (err) {
            console.error(err);
            cb(null);
        }
        else cb(result);
    });
}

module.exports = self;