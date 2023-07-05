const multer = require('multer');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const cloudinary = require('./../utils/imagesCloud');
const Customer = require('./../models/customerModel');
const Workshop = require('./../models/workshopModel');
const Mechanic = require('./../models/mechanicModel');

const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const Email = require('./../utils/email');
const crypto = require('crypto');
const { isDate } = require('util/types');
const Review = require('../models/reviewModel');

// const { Model } = require('mongoose');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, req, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // sameSite: 'none',
    // secure: true,
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    path: '/',
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    // //  request.headers[“X-Forwarded-For”].
  };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // if (process.env.NODE_ENV === 'production') {
  //   // cookieOptions.secure =
  //   //   req.secure || req.headers['x-forwarded-proto') === 'https';
  //   cookieOptions.secure = true;
  // }
  // console.log(req);
  // console.log(req[Symbol(kHeaders)]);

  res.cookie('jwt', token, cookieOptions);
  if (res.cookie('jwt', token, cookieOptions))
    console.log('cookie set successfuly');
  // user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};
module.exports.signUp = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  let rolle = req.body.rolle;
  userData = {
    fName: req.body.fName,
    lName: req.body.lName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    rolle: req.body.rolle,
    image: req.body.image,
  };
  console.log(userData);
  switch (rolle) {
    case 'workshop': {
      const newUser = await Workshop.create(userData);
      const url = `${req.protocol}://${req.get('host')}/me`;
      new Email(newUser, url).sendWelcome();
      createSendToken(newUser, req, 201, res);
      console.log(req);
      console.log(`response is ${res}`);
      console.log(`created`);

      break;
    }
    case 'customer': {
      const newUser = await Customer.create(userData);
      const url = `${req.protocol}://${req.get('host')}/me`;
      new Email(newUser, url).sendWelcome();
      createSendToken(newUser, req, 201, res);
      console.log(req);
      console.log(`response is ${res}`);
      console.log(`created`);
      break;
    }
    case 'mechanic': {
      const newUser = await Mechanic.create(userData);

      const url = `${req.protocol}://${req.get('host')}/me`;
      new Email(newUser, url).sendWelcome();

      createSendToken(newUser, req, 201, res);
      console.log(req);
      console.log(`response is ${res}`);
      console.log(`created`);
      break;
    }
  }
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1)
  if (!email || !password) {
    return next(new AppError('please enter a valid email and password', 400));
  }
  //2)
  const user =
    (await Customer.findOne({ email }).select('+password')) ||
    (await Workshop.findOne({ email }).select('+password')) ||
    (await Mechanic.findOne({ email }).select('+password'));

  if (!user || !(await user.correctMyPassword(password, user.password))) {
    return next(new AppError('invalid email or password', 401));
  }
  //3) send token
  createSendToken(user, req, 200, res);
  console.log(`user logged in :${user}`);
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser =
        (await Customer.findById(decoded.id)) ||
        (await Workshop.findById(decoded.id)) ||
        (await Mechanic.findById(decoded.id));
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      console.log('logedin');
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token && check if it is there
  console.log(req);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(`token from AUTH  is : ${token}`);
  }
  // console.log(req.cookies);
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log(`token from cookies  is : ${token}`);
  } else if (req.body.token) {
    token = req.body.token;
    console.log(`token from body  is : ${token}`);
    // console.log(token);
  }

  if (!token) {
    return next(
      new AppError('you are not loged in , please log in to get access', 401)
    );
  }
  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(`user decoded : ${decoded}`);
  //3)check if user still exists
  const currentUser =
    (await Customer.findById(decoded.id)) ||
    (await Workshop.findById(decoded.id)) ||
    (await Mechanic.findById(decoded.id));

  if (!currentUser) {
    return next(
      new AppError('the user of this token does not longer exist', 401)
    );
  }
  //4) check ifuser changed password after th JWT

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('this user recently changed password ,please try again', 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});
module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)find User
  const user =
    (await Customer.findOne({ email: req.body.email })) ||
    (await Workshop.findOne({ email: req.body.email })) ||
    (await Mechanic.findOne({ email: req.body.email }));

  if (!user) {
    return next(new AppError('there is no user with this email', 404));
  }
  //2) create reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //3)send  reset token the user  via email
  try {
    // const resetUrl = `${req.protocol}://${req.get(host
    const resetUrl = `${req.protocol}://localhost:3000/resetPassword/${resetToken}`;
    console.log(resetUrl);
    console.log(resetToken);
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: `'token has been sent to your email'`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        ' there is an error with  sending this email ,please try again later!',
        500
      )
    );
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user basedon token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(req.params.token);
  console.log(hashedToken);
  const user =
    (await Customer.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })) ||
    (await Workshop.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })) ||
    (await Mechanic.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }));

  // console.log(user);
  if (!user) {
    return next(new AppError('invalid token or it has been expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  //3)log in user
  createSendToken(user, req, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user form collection

  const user =
    (await Customer.findOne(req.user._id).select('+password')) ||
    (await Workshop.findOne(req.user._id).select('+password')) ||
    (await Mechanic.findOne(req.user._id).select('+password'));
  //2) checkif the posted password is correct
  if (
    !(await user.correctMyPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('wrong password', 400));
  }

  //3)update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4)log user  in
  createSendToken(user, req, 200, res);
});

exports.restrictTo = (...rolles) => {
  return (req, res, next) => {
    if (!rolles.includes(req.user.rolle)) {
      return next(
        new AppError('you do not have permission to do this action', 403)
      );
    }
    next();
  };
};

exports.restrictToItsCreator = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const review = await Review.findById(reviewId);
  console.log(reviewId);

  // if (!review) {
  //   return next(new AppError('Review not found'));
  // }

  // console.log(review);
  // console.log(review.customer._id == req.user.id);
  // console.log(review.customer._id);
  // console.log(req.user.id);

  if (!(req.user.id == review.customer._id)) {
    // console.log('you are not allowed,you didnot createdthis review');
    return next(
      new AppError('you do not have permission to do this action', 403)
    );
  }
  next();
});

exports.getMe = catchAsync(async (req, res, next, popOptoins) => {
  req.params.id = req.user.id;
  Model = req.user.constructor;

  console.log(Model);
  let query = Model.findById(req.params.id);
  console.log(req.user.rolle);
  if (req.user.rolle == 'Customer') {
    query = query.populate('cars');
    // popOptoins = { path: 'cars' };
  } else if (req.user.rolle == 'Workshop') {
    query = query.populate('reviews').populate('team').populate('orders');
    // popOptoins = { path: 'reviews' };
  } else if (req.user.rolle == 'Mechanic') {
    query = query.populate('reviews').populate('team').populate('orders');
    // popOptoins = { path: 'reviews' };
  }
  // if (popOptoins) query = query.populate(popOptoins).populate('team');

  const doc = await query;
  if (!doc) {
    return next(new AppError('no document found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.updateCustomerProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for updating password', 400)); // 400 bad request
  }

  // console.log(req.files);
  req.params.id = req.user.id;
  Model = req.user.constructor;
  console.log(Model);
  // // )FilterOut unwanted Fields
  // const filteredBody = filterObj(
  //   req.body,
  //   //allowedFilelds
  //   'image',
  //   'name',
  //   'description',
  //   'phoneNumber',
  //   'fName',
  //   'lName'
  // );

  // filteredBody.image = req.body.image;
  // filteredBody.imageCover = req.body.imageCover;
  // console.log(filteredBody);
  const updatedUser = await Model.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.updateMechanicProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for updating password', 400)); // 400 bad request
  }

  // console.log(req.files);
  req.params.id = req.user.id;
  Model = req.user.constructor;
  console.log(Model);
  // )FilterOut unwanted Fields
  const filteredBody = filterObj(
    req.body,
    //allowedFilelds
    'image',
    'name',
    // 'imageCover',
    'description',
    'phoneNumber',
    'fName',
    'lName'
  );

  filteredBody.image = req.body.image;
  filteredBody.imageCover = req.body.imageCover;
  console.log(filteredBody);
  const updatedUser = await Model.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.updateWorkshopProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for updating password', 400)); // 400 bad request
  }
  // console.log(`req.file from update${req.files}
  // ${req.files.image}`);
  // console.log(req.files);
  req.params.id = req.user.id;
  Model = req.user.constructor;
  console.log(Model);
  // )FilterOut unwanted Fields
  const filteredBody = filterObj(
    req.body,
    //allowedFilelds
    'image',
    'name',
    'imageCover',
    'description',
    'phoneNumber',
    'fName',
    'lName'
  );

  filteredBody.image = req.body.image;
  filteredBody.imageCover = req.body.imageCover;
  console.log(filteredBody);
  const updatedUser = await Model.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  console.log(`body:`);
  console.log(req.body);

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});
