var createError = require('http-errors');
var express = require('express');
var path = require('path');
const { engine } = require('express-handlebars');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var categoryRouter = require('./routes/category');
var productRouter = require('./routes/product');
var { userAuthentication } = require('./helpers/authentication');
app.engine('hbs',
    engine({
        extname: 'hbs',
        defaultLayout: 'home',
        partialsDir: path.join(__dirname, 'views', 'partials'),
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
        helpers: {
            eq: (a, b) => a === b,
        }
    })
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/websitebanxemay')
    .then(() => console.log("Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("Lỗi kết nối MongoDB:", err));
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
const flash = require('connect-flash');
app.use(flash());

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user ? req.user.toObject() : null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});
//end database
app.use(methodOverride('_method'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',userAuthentication, adminRouter);
app.use('/admin/category',userAuthentication, categoryRouter);
app.use('/admin/product',userAuthentication, productRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
