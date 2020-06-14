const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const User = require('./../models/user');
const userProfile = require('../Utilities/userProfileDB');
const userDB = require('../Utilities/userDB');

// Middleware to check if user has logged in for certain routes
const loginRequired = (req, res, next) => {
    if(req.session.userProfile) next();
    else res.redirect('/user/login'); // reroute to login page if the user has not logged in
}

// Rendering login page
router.get('/login', (req, res) => {

    res.render('login.ejs', {
        user: req.session.userProfile,
        errors: null
    });
});

// Performing the login action using post method
router.post(
    '/login',
    [
        check('username')
            .isEmail()
            .normalizeEmail()
            .withMessage("Please enter a valid username"),
        check('password')
            .isLength({ min: 6 })
            .withMessage("Invalid password length.")
    ],
    (req, res) => {

        console.log('req.body: ', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login.ejs', {
                user: req.session.userProfile,
                errors: errors.array()
            });
        }

        let username = req.body['username'];
        let password = req.body['password'];

        console.log("password: ", password);

        userDB.findUser(username, (result) => {

            console.log("user result: ", "'"+result+"'");

            if (result == null) {
                return res.render('login.ejs', {
                    user: req.session.userProfile,
                    errors: [{ msg: "Username doesn't exist." }]
                });
            }

            bcrypt.compare(
                password,
                result.password,
                function (err, compareResult) {

                    if (compareResult != true) {
                        return res.render('login.ejs', {
                            user: req.session.userProfile,
                            errors: [{ msg: "Invalid password." }]
                        });

                    } else {

                        //Adding user profile data to session
                        req.session.userProfile = result;
                        res.redirect('/user/connections');
                    }
                });
        });
    });

// Performing logout action
router.get('/logout', loginRequired, (req, res) => {

    req.session.userProfile = null; 
    res.redirect('/');
});

// Performing action to add a rsvp
router.post(
    '/rsvp',
    [
        check('connection-id')
            .isNumeric()
            .isLength({ min: 1 })
            .withMessage("Invalid connection id"),
        check('rsvp-type')
            .isIn(['yes', 'no', 'maybe'])
            .withMessage("Invalid rsvp value")
    ],
    loginRequired,
    (req, res) => {

        console.log("req.body['rsvp-type']: ", req.body['rsvp-type']);

        const errors = validationResult(req);
        console.log("rsvp errors: ", errors);
        if (!errors.isEmpty()) {
            return res.redirect('connections');
        }

        userProfile.addConnectionById(
        req.session.userProfile._id,
        req.body['connection-id'],
        req.body['rsvp-type'],
        (result) => {
            res.redirect('/user/connections'); // redirecting to my connections
        });
});

// Performing action to delete a rsvp
router.delete(
    '/rsvp',
    [
        check('connection-id')
            .isNumeric()
            .isLength({ min: 1 })
            .withMessage("Invalid connection id")
    ],
    loginRequired,
    (req, res) => {

        const errors = validationResult(req);
        console.log("rsvp errors: ", errors);
        if (!errors.isEmpty()) {
            return res.redirect('connections');
        }

        userProfile.removeConnectionById(
        req.session.userProfile._id,
        req.body['connection-id'],
        (result) => {
            res.redirect('/user/connections'); // redirecting to my connections
        });
});

// Performing action to update a rsvp 
router.put(
    '/rsvp',
    [
        check('connection-id')
            .isNumeric()
            .isLength({ min: 1 })
            .withMessage("Invalid connection id"),
        check('rsvp-type')
            .isIn(['yes', 'no', 'maybe'])
            .withMessage("Invalid rsvp value")
    ],
    loginRequired,
    (req, res) => {

        const errors = validationResult(req);
        console.log("rsvp errors: ", errors);
        if (!errors.isEmpty()) {
            return res.redirect('connections');
        }

        userProfile.addConnectionById(
            req.session.userProfile._id,
            req.body['connection-id'],
            req.body['rsvp-type'],
            (result) => {
                res.redirect('/user/connections'); // redirecting to my connections
            });
});

// Rendering my connections page
router.get('/connections', loginRequired, (req, res) => {

    userProfile.getUserConnections(req.session.userProfile._id, (result) => {

        userConnections = result;
        res.render('savedConnections.ejs', {
            userConnections: userConnections,
            user: req.session.userProfile,
            errors: null
        });
    });
});

module.exports = router;