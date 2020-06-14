const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {

    console.log("Page not found.")

    res.render('page_404.ejs', {
        user: req.session.userProfile,
        errors: null
    });
});

module.exports = router;