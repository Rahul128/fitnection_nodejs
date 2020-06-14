const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {

    res.render('index.ejs', {
        user: req.session.userProfile,
        errors: null
    });
});

module.exports = router;