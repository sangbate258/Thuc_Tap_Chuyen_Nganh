var express = require('express');
var router = express.Router();

// ✅ sửa đúng tên file (quan trọng khi deploy Linux host)
const Category = require('../models/Category');
const Product = require('../models/Product'); // ✅ để kiểm tra ràng buộc

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

router.get('/', function(req, res, next) {
    Category.find({}).sort({ createdAt: -1 })
        .then(async (categories) => {
            // (Tuỳ chọn) đếm số product đang dùng category để hiển thị
            // giữ đơn giản: count theo từng category
            const cats = await Promise.all(categories.map(async (cat) => {
                const obj = cat.toObject();

                // đếm số product đang dùng category này
                // (nếu product cũ chưa có field category thì count sẽ = 0)
                obj.usedCount = await Product.countDocuments({ category: obj._id });

                return obj;
            }));

            res.render('admin/category/category-list', {
                categories: cats
            });
        })
        .catch(next);
});

// 2. CREATE - Hiển thị form thêm mới (GET /admin/category/create)
router.get('/create', function(req, res, next) {
    res.render('admin/category/category-create');
});

// 3. CREATE - Xử lý lưu dữ liệu (POST /admin/category/create)
router.post('/create', function(req, res, next) {
    const newCategory = new Category({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        status: req.body.status === 'true'
    });

    newCategory.save()
        .then(() => {
            req.flash('success_message', 'Create category successfully!');
            res.redirect('/admin/category');
        })
        .catch(next);
});

// 4. UPDATE - Hiển thị form sửa (GET /admin/category/edit/:id)
router.get('/edit/:id', function(req, res, next) {
    Category.findById(req.params.id)
        .then(category => {
            if (!category) return res.redirect('/admin/category');
            res.render('admin/category/category-edit', {
                category: category.toObject()
            });
        })
        .catch(next);
});

// 5. UPDATE - Xử lý cập nhật (PUT /admin/category/edit/:id)
router.put('/edit/:id', function(req, res, next) {
    Category.findById(req.params.id)
        .then(category => {
            if (!category) return res.redirect('/admin/category');

            category.name = req.body.name;
            category.description = req.body.description;
            category.image = req.body.image;
            category.status = req.body.status === 'true';

            return category.save();
        })
        .then(() => {
            req.flash('success_message', 'Update category successfully!');
            res.redirect('/admin/category');
        })
        .catch(next);
});

// 6. DELETE - Xóa danh mục (DELETE /admin/category/delete/:id)
// ✅ FK-like RESTRICT: không cho xóa nếu có product đang dùng
router.delete('/delete/:id', function(req, res, next) {
    const id = req.params.id;

    Product.countDocuments({ category: id })
        .then(count => {
            if (count > 0) {
                req.flash('error_message', 'Không thể xóa Category: đang có Product sử dụng category này.');
                return res.redirect('/admin/category');
            }

            return Category.deleteOne({ _id: id })
                .then(() => {
                    req.flash('success_message', 'Delete category successfully!');
                    res.redirect('/admin/category');
                });
        })
        .catch(next);
});

module.exports = router;