const AppError = require('./../utils/appError');

const sendErrorProd = (err, res) => {
  // console.log(`is operationaal is ${err.isOperational}`);
  //console.log(err);
  //console.log(typeof err);
  // if (err.isOperational) {
  console.log(err.isOperational);
  if (err) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //  console.error('error!!!', err);
    res.status(500).json({
      status: 'error',
      message: `something went@@@@@  wrong${err.isOperational}`,
    });
  }
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handelCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handelDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
  const message = `duplicate field Value : x. please use another value`;
  return new AppError(message, 400);
};

const handelValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handelJwtError = () =>
  new AppError('Invalid token please login again!', 401);

const handelJwtExpiredError = () => new AppError('Expired Token', 401);

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // 500 stands for internal servererror
  err.status = err.status || 'error'; //

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //    let error = { ...err };
    let error = err;
    // console.log('---------------------', err);
    // console.log(error);
    if (error.name === 'CastError') error = handelCastErrorDB(error);
    if (error.code === 11000) error = handelDuplicateFieldsDB(error);
    if (error.name === 'ValidatorError') error = handelValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handelJwtError(error);
    if (error.name === 'TokenExpiredError')
      error = handelJwtExpiredError(error);

    sendErrorProd(error, res);
  }
};
