var express = require('express');
var router = express.Router();

/* GET admin product page. */
router.get('/product', function(req, res, next) {
    // Bảo Express: Dùng "Nhân" là 'admin_product'
    // và "Khung" là 'layout_admin'
    res.render('admin_product', { layout: 'layout_admin' });
});

module.exports = router;