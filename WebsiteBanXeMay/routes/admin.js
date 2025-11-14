var express = require('express');
var router = express.Router();

router.all('/*', function(req, res,next) {
    res.app.locals.layout = 'admin';
    next();
})
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('admin/index', { title: 'Admin' });
});
router.get('/product-add', function(req, res, next) {
    res.render('admin/product-add/product-add', { title: 'Admin' });
});
router.get('/ecommerce_prod', function(req, res, next) {
    res.render('admin/ecommerce_prod', { title: 'Admin' });
});
router.get('/ecommerce_prod_details', function(req, res, next) {
    res.render('admin/ecommerce_prod_details', { title: 'Admin' });
});
router.get('/ecommerce_orders', function(req, res, next) {
    res.render('admin/ecommerce_orders', { title: 'Admin' });
});
router.get('/ecommerce_orders_detail', function(req, res, next) {
    res.render('admin/ecommerce_orders_detail', { title: 'Admin' });
});
router.get('/ecommerce_customers', function(req, res, next) {
    res.render('admin/ecommerce_customers', { title: 'Admin' });
});
router.get('/ecommerce_sellers', function(req, res, next) {
    res.render('admin/ecommerce_sellers', { title: 'Admin' });
});
router.get('/cart', function(req, res, next) {
    res.render('admin/cart', { title: 'Admin' });
});
router.get('/checkout', function(req, res, next) {
    res.render('admin/checkout', { title: 'Admin' });
});
router.get('/billing', function(req, res, next) {
    res.render('admin/billing', { title: 'Admin' });
});
router.get('/invoice', function(req, res, next) {
    res.render('admin/invoice', { title: 'Admin' });
});
router.get('/pricing', function(req, res, next) {
    res.render('admin/pricing', { title: 'Admin' });
});

router.get('/category', function(req, res, next) {
    res.render('admin/category/category-list', { title: 'Admin' });
});

module.exports = router;