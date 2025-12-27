var express = require('express');
var router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcryptjs = require('bcryptjs');

const Product = require('../models/Product');
const Category = require('../models/Category');

router.all('/*', function(req, res,next) {
    res.app.locals.layout = 'home';
    next();
});

function escapeRegex(text = '') {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* HOME */
router.get('/', async function(req, res, next) {
    try {
        const latestProducts = await Product.find({ status: true })
            .populate('category')
            .sort({ createdAt: -1, _id: -1 })
            .limit(6)
            .lean();

        latestProducts.forEach(p => {
            p._id = p._id.toString();
            p.categoryName = p.category ? p.category.name : '';
        });

        res.render('home/index', { title: 'Home', latestProducts });
    } catch (err) {
        next(err);
    }
});

/* LOGIN/REGISTER (GIỮ NGUYÊN) */
router.get('/login', function (req, res, next) {
    res.render('home/login', {title: 'Login'});
});

passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
    User.findOne({email: email}).then(user => {
        if (!user)
            return done(null, false, {message: 'User not found'});

        bcryptjs.compare(password, user.password, (err, matched) => {
            if (err) return done(err);
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Wrong email or password'});
            }
        });
    }).catch(err => done(err));
}));

router.post('/login', (req, res, next) => {
    let errors = [];

    if (!req.body.email) errors.push({ message: 'Email required.' });
    if (!req.body.password) errors.push({ message: 'Password required.' });
    if (req.body.email && !req.body.email.includes('@')) errors.push({ message: 'Email invalid.' });

    if (errors.length > 0) {
        return res.render('home/login', {
            title: 'Login',
            errors: errors,
            email: req.body.email
        });
    }

    passport.authenticate('local',  {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err);
    }
});

router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

router.get('/register', function (req, res, next) {
    res.render('home/register', {title: 'Register'});
});

router.post('/register', (req, res, next) => {
    let errors = [];
    if (!req.body.firstName) errors.push({message: 'First name is required'});
    if (!req.body.lastName) errors.push({message: 'Last name is required'});
    if (!req.body.email) errors.push({message: 'E-mail is required'});
    if(req.body.password1 !== req.body.password) errors.push({message: 'Confirm password is not match'});
    if (errors.length > 0) {
        return res.render('home/register', {
            title: 'Register',
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });
    }

    User.findOne({email: req.body.email}).then((user) => {
        if (!user) {
            const newUser = new User({
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            });

            bcryptjs.genSalt(10, function (err, salt) {
                bcryptjs.hash(newUser.password, salt, (err, hash) => {
                    newUser.password = hash;
                    newUser.save().then(() => {
                        req.flash('success_message', 'Successfully registered!');
                        res.redirect('/login');
                    });
                });
            });
        } else {
            req.flash('error_message', 'E-mail is exist!');
            res.redirect('/register');
        }
    }).catch(next);
});

/* SHOP (search + pagination) */
router.get('/shop', async function(req, res, next) {
    try {
        const keyword = (req.query.keyword || '').trim();

        let page = parseInt(req.query.page || '1', 10);
        if (isNaN(page) || page <= 0) page = 1;

        const perPage = 9;

        // filter cơ bản
        const filter = { status: true };

        if (keyword) {
            const safe = escapeRegex(keyword);
            const regex = new RegExp(safe, 'i');

            // search title OR category name
            const matchedCats = await Category.find({ name: regex }).select('_id').lean();
            const catIds = matchedCats.map(c => c._id);

            const orConditions = [{ title: regex }];
            if (catIds.length > 0) orConditions.push({ category: { $in: catIds } });

            filter.$or = orConditions;
        }

        const total = await Product.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        if (page > totalPages) page = totalPages;

        const products = await Product.find(filter)
            .populate('category')
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean();

        products.forEach(p => {
            p._id = p._id.toString();
            p.categoryName = p.category ? p.category.name : '';
        });

        const pages = [];
        let start = page - 2; if (start < 1) start = 1;
        let end = page + 2; if (end > totalPages) end = totalPages;
        for (let i = start; i <= end; i++) pages.push({ num: i, isCurrent: i === page });

        res.render('home/shop', {
            title: 'Shop',
            products,
            keyword,
            pagination: {
                total,
                page,
                totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages,
                prevPage: page > 1 ? page - 1 : 1,
                nextPage: page < totalPages ? page + 1 : totalPages,
                pages
            }
        });
    } catch (err) {
        next(err);
    }
});

/* SHOP DETAIL */
router.get('/shop_detail/:id?', async function(req, res, next) {
    try {
        const id = req.params.id || req.query.id;
        if (!id) return res.redirect('/shop');

        const product = await Product.findOne({ _id: id, status: true })
            .populate('category')
            .lean();

        if (!product) {
            return res.status(404).render('home/error', { title: 'Not Found' });
        }

        product._id = product._id.toString();
        product.categoryName = product.category ? product.category.name : '';

        // related by same category
        const related = await Product.find({
            status: true,
            category: product.category ? product.category._id : null,
            _id: { $ne: product._id }
        })
            .populate('category')
            .sort({ createdAt: -1, _id: -1 })
            .limit(3)
            .lean();

        related.forEach(r => {
            r._id = r._id.toString();
            r.categoryName = r.category ? r.category.name : '';
        });

        res.render('home/shop_detail', { title: 'Shop Detail', product, related });
    } catch (err) {
        next(err);
    }
});

/* OTHER PAGES (GIỮ NGUYÊN) */
router.get('/about', function(req, res, next) { res.render('home/about', { title: 'Express' }); });
router.get('/cart', function(req, res, next) { res.render('home/cart', { title: 'Express' }); });
router.get('/checkout', function(req, res, next) { res.render('home/checkout', { title: 'Express' }); });
router.get('/blog', function(req, res, next) { res.render('home/blog', { title: 'Express' }); });
router.get('/blog_detail', function(req, res, next) { res.render('home/blog_detail', { title: 'Express' }); });
router.get('/team', function(req, res, next) { res.render('home/team', { title: 'Express' }); });
router.get('/pricing', function(req, res, next) { res.render('home/pricing', { title: 'Express' }); });
router.get('/contact', function(req, res, next) { res.render('home/contact', { title: 'Express' }); });
router.get('/customer', function(req, res, next) { res.render('home/customer', { title: 'Express' }); });

module.exports = router;