var express = require('express');
const {engine} = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//app.engine('hbs', engine({ defaultLayout: 'layouts' }));
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        defaultLayout: 'layouts',
        partialsDir: path.join(__dirname, 'views', 'partials'),
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
    })
);

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());
//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// You might also need custom middleware to make flash messages available in templates
app.use((req, res, next) => {
    res.locals.user = req.user ? req.user.toObject() : null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error'); // Passport.js often uses 'error'
    res.locals.errors = req.flash('errors');
    next();
});
//load Route
var indexRouter = require('./routes/home');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

console.log(path.join(__dirname, 'views', 'layouts'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);

//database mongoDB
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Strategy: LocalStrategy} = require("passport-local");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/node') // No callback here
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });
//end mongoDB


// app.post('/login', (req, res) => {
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
// app.post('/register',  (req,res) => {
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
module.exports = app;
