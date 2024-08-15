var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const nodemailer = require("nodemailer");
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var productsRouter = require('./routes/products');
// var categoriesRouter = require('./routes/categories');
var ApiRouter = require('./routes/Api');
var app = express();
var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your_secret_key', // Thay đổi `your_secret_key` bằng key bí mật của bạn
  resave: false,
  saveUninitialized: true,
}));


// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/products', productsRouter);
// app.use('/categories', categoriesRouter);
app.use('/Api', ApiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// app.post("/hello", (req, res, next) => {
//   try {
//     res.status(200).render("hello");
//     console.log("hello");
//   } catch (error) {
//     next(error);
//   }
// });
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
