var express = require('express');
var router = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
router.all('/*', function (
    req,
    res,
    next) {
    res.app.locals.layout = 'home';
    next();
})

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home/index', {title: 'Home'});
});
router.get('/login', function (req, res, next) {
    res.render('home/login', {title: 'Login'});
});


//APP LOGIN
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
    passport.authenticate('local', {
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
// router.post('/login', (req, res) => {
//     User.findOne({email: req.body.email}).then((user) => {
//         if (user) {
//             bcryptjs.compare(req.body.password,user.password,(err,matched)=>{
//                 if(err) return err;
//                 if(matched){
//                     res.send("User was logged in");
//                     res.redirect("/admin/dashboard");
//                 }else {
//                     res.send("User was not logged in");
//                 }
//             })
//         }
//     })
// });
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
        errors.push({message: 'First name is required 1'});
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
                res.redirect('/login');
            }

        });

    }
});
// router.post('/register',  (req,res) => {
//         const newUser = new User();
//         newUser.email = req.body.email;
//         newUser.password = req.body.password;
//         bcryptjs.genSalt(10, function (err, salt) {
//             bcryptjs.hash(newUser.password, salt, function (err, hash) {
//                 if (err) {return  err}
//                 newUser.password = hash;
//
//                 newUser.save().then(userSave=>
//                 {
//                     res.send('USER SAVED');
//                 }).catch(err => {
//                     res.send('USER ERROR'+err);
//                 });
//             });
//         });
//     }
// );
router.get('/shop', function (req, res, next) {
    res.render('home/shop', {title: 'Shop'});
});
router.get('/about', function (req, res, next) {
    res.render('home/about', {title: 'Shop'});
});


module.exports = router;
