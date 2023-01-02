const path = require('path');
const morgan = require('morgan');
const express = require('express');
const tourRouter = require('./Routes/tourRoutes');
const AppError = require('./utilis/appError');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewRouter = require('./Routes/viewRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./Routes/userRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1)Midlle wares

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'blob:'],
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
    },
  })
);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: `Too many requests from this IP, please try again in an hour`,
});

app.use('/api', limiter);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data sanitization against NoSQL injection

app.use(mongoSantize());

// Data sanitization against XXss

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// 3)Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
