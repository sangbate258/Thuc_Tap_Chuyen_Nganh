var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/singlePage', function(req, res, next) {
    res.render('singlePage');
});

module.exports = router;