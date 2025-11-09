var createError = require('http-errors');
var express = require('express');
var path = require('path');
const { engine } = require('express-handlebars');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var shopRouter = require('./routes/shop');
var aboutRouter = require('./routes/about');
var detailRouter = require('./routes/detail');
var cartRouter = require('./routes/cart');
var checkoutRouter = require('./routes/checkout');
var blogRouter = require('./routes/blog');
var blog_detailRouter = require('./routes/blog_detail');
var teamRouter = require('./routes/team');
var pricingRouter = require('./routes/pricing');
var contactRouter = require('./routes/contact');

var adminRouter = require('./routes/admin');
var app = express();

app.engine('hbs',
    engine({
        extname: 'hbs',
        defaultLayout: 'layouts',
        partialsDir: path.join(__dirname, 'views', 'partials'),
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
    })
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shop', shopRouter);
app.use('/about', aboutRouter);
app.use('/detail',detailRouter);
app.use('/cart',cartRouter);
app.use('/checkout',checkoutRouter);
app.use('/blog',blogRouter);
app.use('/blog_detail',blog_detailRouter);
app.use('/team',teamRouter);
app.use('/pricing',pricingRouter);
app.use('/contact',contactRouter);

app.use('/admin', adminRouter);
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
