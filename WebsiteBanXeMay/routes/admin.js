var express = require('express');
var router = express.Router();
router.all('/*', function(req, res,next) {
        res.app.locals.layout = 'admin';
        next();
})

// function ensureAdmin(req, res, next) {
//     if (req.isAuthenticated()) {
//
//         if (req.user.role === 'admin') {
//             return next();
//         } else {
//             req.flash('error_message', 'Bạn không đủ quyền hạn để vào đây!');
//             return res.redirect('/');
//         }
//     }
//
//     req.flash('error_message', 'Vui lòng đăng nhập để truy cập Admin!');
//     res.redirect('/login');
// }
//
// router.use(ensureAdmin);

/* GET home page. */
router.get('/', function(req, res, next) {
        res.render('admin/index', { title: 'Admin' });
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


module.exports = router;