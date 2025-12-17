var express = require('express');
var router = express.Router();
const passport = require('passport');  // <--- Bạn đang thiếu dòng này
const LocalStrategy = require('passport-local').Strategy; // <--- Khả năng cao bạn cũng thiếu dòng này
const User = require('../models/User'); // Import Model User
const bcryptjs = require('bcryptjs');   // Import thư viện mã hóa
router.all('/*', function(req, res,next) {
    res.app.locals.layout = 'home';
    next();
})
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home/index', { title: 'Home' });
});
router.get('/login', function (req, res, next) {
    res.render('home/login', {title: 'Login'});
});
passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
    User.findOne({email: email}).then(user => {
        if (!user)
            return done(null, false, {message: 'User not found'});

        bcryptjs.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Wrong email or password'});
            }
        });

    });
}));
router.post('/login', (req, res, next) => {
    let errors = [];

    // 1. Kiểm tra thủ công (Validation) giống bên Register
    if (!req.body.email) {
        errors.push({ message: 'Email required.' });
    }
    if (!req.body.password) {
        errors.push({ message: 'Password required.' });
    }
    if (req.body.email && !req.body.email.includes('@')) {
        errors.push({ message: 'Email invalid.' });
    }
    if (errors.length > 0) {
        return res.render('home/login', {
            title: 'Login',
            errors: errors,
            email: req.body.email
        });
    }
    passport.authenticate('local',  {

    // (err, user,info) =>

        // if (!user) {
        //     req.flash('error', info.message);
        //     return res.redirect('/login');
        // }
        // req.logIn(user, (err) => {
        //     if (err) { return next(err); }
        //     if (user.role === 'admin') {
        //         return res.redirect('/admin');
        //     } else {
        //         return res.redirect('/');
        //     }
        // });
        successRedirect: '/admin',
            failureRedirect: '/login',
            failureFlash: true
    })(req, res, next);
});
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user); // Pass the user to the done callback
    } catch (err) {
        done(err); // Pass the error to the done callback if an error occurred
    }
});
router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            return res.status(500).send(err); // Handle the error appropriately
        }
        res.redirect('/'); // Redirect after logout
    });

})
router.get('/register', function (req, res, next) {
    res.render('home/register', {title: 'Register'});
})
router.post('/register', (req, res, next) => {

    let errors = [];
    if (!req.body.firstName) {
        errors.push({message: 'First name is required'});
    }
    if (!req.body.lastName) {
        errors.push({message: 'Last name is required'});
    }
    if (!req.body.email) {
        errors.push({message: 'E-mail is required'});
    }

    if (errors.length > 0) {
        res.render('home/register', {
            title: 'Register',
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });
    } else {
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
                        newUser.save().then(saveUser => {
                            req.flash('success_message', 'Successfully registered!');
                            res.redirect('/login');//or /login
                        });
                    })
                })
            } else {
                req.flash('error_message', 'E-mail is exist!');
                res.redirect('/register');
            }

        });

    }
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
