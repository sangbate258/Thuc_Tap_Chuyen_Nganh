var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/shop', function(req, res, next) {
    res.render('shop');
});
router.get('/singlePage', function(req, res, next) {
    res.render('singlePage');
});
module.exports = router;
