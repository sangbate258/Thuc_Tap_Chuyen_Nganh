var express = require('express');
var router = express.Router();
router.all('/*', function(req, res,next) {
    res.app.locals.layout = 'home';
    next();
})
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home/index', { title: 'Home' });
});
router.get('/about', function(req, res, next) {
    res.render('hom' +
        'e/about', { title: 'Express' });
});
router.get('/shop', function(req, res, next) {
    res.render('home/shop', { title: 'Express' });
});
router.get('/shop_detail', function(req, res, next) {
    res.render('home/shop_detail', { title: 'Express' });
});
router.get('/cart', function(req, res, next) {
    res.render('home/cart', { title: 'Express' });
});
router.get('/checkout', function(req, res, next) {
    res.render('home/checkout', { title: 'Express' });
});
router.get('/blog', function(req, res, next) {
    res.render('home/blog', { title: 'Express' });
});
router.get('/blog_detail', function(req, res, next) {
    res.render('home/blog_detail', { title: 'Express' });
});
router.get('/team', function(req, res, next) {
    res.render('home/team', { title: 'Express' });
});
router.get('/pricing', function(req, res, next) {
    res.render('home/pricing', { title: 'Express' });
});
router.get('/contact', function(req, res, next) {
    res.render('home/contact', { title: 'Express' });
});

router.get('/customer', function(req, res, next) {
    res.render('home/customer', { title: 'Express' });
});

module.exports = router;
