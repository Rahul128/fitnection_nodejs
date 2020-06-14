const express = require('express');
const { check, validationResult } = require('express-validator');

const dbConnection = require('./../Utilities/connectionDB');
const userProfile = require('../Utilities/userProfileDB');

let thisModule = {
    connection: express.Router(), // Serves "/connection" route
    connections: express.Router() // Serves "/connections" routes
};

// Checking if the user has logged in for certain routes
const loginRequired = (req, res, next) => {
    if (req.session.userProfile) next();
    else res.redirect('/user/login');
}

// Rendering all connections page
thisModule.connections.get('/', (req, res) => {

    // Fetching all connections
    dbConnection.getConnectionsGroupedByCategory((result) => {

        res.render('connections.ejs', {
            connections: result,
            connectionsSize: result.length,
            user: req.session.userProfile,
            errors: null
        });
    });
});

// Rendering new connection page
thisModule.connections.get('/new', loginRequired, (req, res) => {

    res.render('newConnection.ejs', {
        user: req.session.userProfile,
        errors: null
    });
});

thisModule.connections.post(
    '/new',
    [
        check('topic')
            .isLength({ min: 4 })
            .trim()
            .escape()
            .withMessage("Topic should be of atleast 4 characters."),
        check('name')
            .isLength({ min: 4 })
            .withMessage("Connection name should be atleast of 4 chars."),
        check('name')
            .isAlphanumeric()
            .trim()
            .escape()
            .withMessage("Characters in connection name can either be alphabet or number, nothing else."),
        check('details')
            .isLength({ min: 10 })
            .trim()
            .escape()
            .withMessage("Description should be of atleast 10 characters."),
        check('where')
            .isLength({ min: 3 })
            .trim()
            .escape()
            .withMessage("Location should be of atleast 3 chars."),
        check('when')
            .escape()
            .toDate(),
        check('at')
            .matches('^([0-2][0-9]):[0-5][0-9]')
            .escape()
            .withMessage("Please select valid time ")
    ],
    loginRequired,
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('newConnection.ejs', {
                user: req.session.userProfile,
                errors: errors.array()
            });
        }

        dbConnection.saveConnection(req.body, (result) => {
            if (result == null) {
                console.log("Unable to save connection : ", req.body);
            }

            userProfile.addConnectionById(
                req.session.userProfile._id,
                result.connectionId,
                'yes',
                (result_2) => {
                    res.redirect('/user/connections'); // redirecting to my connections
                });
        });
    });

// Rendering a single connection details page
thisModule.connection.get(
    '/:connectionId',
    [
        check('connectionId')
            .isNumeric()
            .isLength({ min: 1 })
            .withMessage("Invalid connection id")
    ],
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.redirect('/connections')
        }

        var connectionId = null;
        var connectionExists = false;

        // Checking if the connection id is of valid format
        if (req.params && req.params.connectionId) {

            connectionId = req.params.connectionId;

            // Fetching the connection details of a particular connection
            dbConnection.getConnectionById(connectionId, (result) => {
                if (result) {

                    connectionExists = req.userProfile ? req.userProfile.userHasConnectionWithId(connectionId) : false;

                    res.render('connection.ejs', {
                        connection: result,
                        user: req.session.userProfile,
                        connectionExists: connectionExists,
                        errors: null
                    });

                } else {

                    res.redirect('/connections') // Redirect to all connections
                }
            });

        } else {

            res.redirect('/connections') // Redirect to all connections
        }

    });

module.exports = thisModule;