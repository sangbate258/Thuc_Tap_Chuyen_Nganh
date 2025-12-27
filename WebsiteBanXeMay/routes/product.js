var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

function escapeRegex(text = '') {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * LIST: /admin/product?keyword=...&page=...&limit=10|20|-1
 * Search theo:
 * - Product.title
 * - Category.name (FK-like)
 */
router.get('/', async function(req, res, next) {
    try {
        const keyword = (req.query.keyword || '').trim();

        let page = parseInt(req.query.page || '1', 10);
        if (isNaN(page) || page <= 0) page = 1;

        let limit = parseInt(req.query.limit || '10', 10);
        const allowedLimits = [10, 20, -1];
        if (!allowedLimits.includes(limit)) limit = 10;

        const filter = {};

        if (keyword) {
            const safe = escapeRegex(keyword);
            const regex = new RegExp(safe, 'i');

            // 1) match theo title
            const orConditions = [{ title: regex }];

            // 2) match theo category.name => tìm category ids trước
            const matchedCats = await Category.find({ name: regex }).select('_id').lean();
            const catIds = matchedCats.map(c => c._id);

            if (catIds.length > 0) {
                orConditions.push({ category: { $in: catIds } });
            }

            filter.$or = orConditions;
        }

        const total = await Product.countDocuments(filter);

        let totalPages = 1;
        if (limit !== -1) {
            totalPages = Math.max(1, Math.ceil(total / limit));
            if (page > totalPages) page = totalPages;
        } else {
            page = 1;
            totalPages = 1;
        }

        let query = Product.find(filter)
            .populate('category')
            .sort({ createdAt: -1, _id: -1 });

        if (limit !== -1) {
            query = query.skip((page - 1) * limit).limit(limit);
        }

        const products = await query.lean();

        const mapped = products.map(p => {
            p._id = p._id.toString();
            p.categoryName = p.category ? p.category.name : '';
            return p;
        });

        const pages = [];
        if (limit !== -1) {
            let start = page - 2;
            let end = page + 2;
            if (start < 1) start = 1;
            if (end > totalPages) end = totalPages;
            for (let i = start; i <= end; i++) pages.push({ num: i, isCurrent: i === page });
        }

        const from = total === 0 ? 0 : (limit === -1 ? 1 : (page - 1) * limit + 1);
        const to = total === 0 ? 0 : (limit === -1 ? total : Math.min(total, (page - 1) * limit + mapped.length));

        res.render('admin/product/product-list', {
            products: mapped,
            keyword,
            limit,
            pagination: {
                total,
                from,
                to,
                page,
                totalPages,
                prevPage: page > 1 ? page - 1 : 1,
                nextPage: page < totalPages ? page + 1 : totalPages,
                pages
            }
        });
    } catch (err) {
        next(err);
    }
});

// ======= PHẦN CRUD GIỮ NGUYÊN (create/edit/delete) =======

// FORM CREATE
router.get('/create', function(req, res, next) {
    Category.find({ status: true }).sort({ name: 1 })
        .then(categories => {
            res.render('admin/product/product-create', {
                categories: categories.map(c => {
                    const obj = c.toObject();
                    obj._id = obj._id.toString();
                    return obj;
                }),
                form: {}
            });
        })
        .catch(next);
});

// CREATE
router.post('/create', function(req, res, next) {
    const categoryId = (req.body.category || '').trim();

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return Category.find({ status: true }).sort({ name: 1 })
            .then(categories => {
                res.render('admin/product/product-create', {
                    error_message: 'Category không hợp lệ. Vui lòng chọn lại.',
                    categories: categories.map(c => {
                        const obj = c.toObject();
                        obj._id = obj._id.toString();
                        return obj;
                    }),
                    form: req.body
                });
            })
            .catch(next);
    }

    const newProduct = new Product({
        title: req.body.title,
        category: categoryId,
        price: req.body.price,
        year: req.body.year,
        condition: req.body.condition,
        image: req.body.image,
        description: req.body.description,
        status: req.body.status === 'true'
    });

    newProduct.save()
        .then(() => res.redirect('/admin/product'))
        .catch(err => {
            console.log('Lỗi thêm sản phẩm:', err && err.message ? err.message : err);
            Category.find({ status: true }).sort({ name: 1 })
                .then(categories => {
                    res.render('admin/product/product-create', {
                        error_message: 'Thêm sản phẩm thất bại. Vui lòng kiểm tra dữ liệu.',
                        categories: categories.map(c => {
                            const obj = c.toObject();
                            obj._id = obj._id.toString();
                            return obj;
                        }),
                        form: req.body
                    });
                })
                .catch(next);
        });
});

// FORM EDIT
router.get('/edit/:id', function(req, res, next) {
    Promise.all([
        Product.findById(req.params.id),
        Category.find({ status: true }).sort({ name: 1 })
    ])
        .then(([product, categories]) => {
            if (!product) return res.redirect('/admin/product');

            const productObj = product.toObject();
            productObj._id = productObj._id.toString();
            productObj.category = productObj.category ? productObj.category.toString() : '';

            res.render('admin/product/product-edit', {
                product: productObj,
                categories: categories.map(c => {
                    const obj = c.toObject();
                    obj._id = obj._id.toString();
                    return obj;
                })
            });
        })
        .catch(next);
});

// UPDATE
router.put('/edit/:id', function(req, res, next) {
    const categoryId = (req.body.category || '').trim();

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return Promise.all([
            Product.findById(req.params.id),
            Category.find({ status: true }).sort({ name: 1 })
        ])
            .then(([product, categories]) => {
                if (!product) return res.redirect('/admin/product');

                const productObj = product.toObject();
                productObj._id = productObj._id.toString();
                productObj.category = categoryId;

                productObj.title = req.body.title;
                productObj.price = req.body.price;
                productObj.year = req.body.year;
                productObj.condition = req.body.condition;
                productObj.image = req.body.image;
                productObj.description = req.body.description;
                productObj.status = req.body.status === 'true';

                res.render('admin/product/product-edit', {
                    error_message: 'Category không hợp lệ. Vui lòng chọn lại.',
                    product: productObj,
                    categories: categories.map(c => {
                        const obj = c.toObject();
                        obj._id = obj._id.toString();
                        return obj;
                    })
                });
            })
            .catch(next);
    }

    Product.findById(req.params.id)
        .then(product => {
            if (!product) return res.redirect('/admin/product');

            product.title = req.body.title;
            product.category = categoryId;
            product.price = req.body.price;
            product.year = req.body.year;
            product.condition = req.body.condition;
            product.image = req.body.image;
            product.description = req.body.description;
            product.status = req.body.status === 'true';

            return product.save();
        })
        .then(() => res.redirect('/admin/product'))
        .catch(next);
});

// DELETE
router.delete('/delete/:id', function(req, res, next) {
    Product.deleteOne({ _id: req.params.id })
        .then(() => res.redirect('/admin/product'))
        .catch(next);
});

module.exports = router;