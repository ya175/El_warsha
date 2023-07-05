const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const customerRouter = require('./routes/customerRoutes');
const mechanicRouter = require('./routes/mechanicRoutes');
const workshopRouter = require('./routes/workshopRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const userRouter = require('./routes/userRoutes');
const carRouter = require('./routes/carRoutes');

const app = express();
// app.enable('trust proxy');

app.use(cors());
app.options('*', cors());

// var corsOptions = {
//   // origin: 'http://localhost:3000',
//   credentials: true,
// };

// app.use(cors(corsOptions));

// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   // console.log(req);
//   // console.log(`req.cookies: ${req}`);
//   next();
// });

app.use(fileupload({ useTempFiles: true }));
//limit requests from same api

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this api,please try again in 1 hour',
});
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
// app.use(express.json());
app.use(cookieParser());

// {    "email":{"$gt":""},
//     "password":"pass1234455"
// }

//data sanitization against no sql query injection
app.use(mongoSanitize());

//data sanitization against XSS  (cross-site-sripting)
app.use(xss());

app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/mechanics', mechanicRouter);
app.use('/api/v1/workshops', workshopRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cars', carRouter);
app.all('*', (req, res, next) => {
  next(new appError(`can not find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
