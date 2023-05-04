const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const Customer = require('./../models/customerModel');
const Workshop = require('./../models/workshopModel');
const Mechanic = require('./../models/mechanicModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Email = require('./../utils/email');
const crypto = require('crypto');
const { isDate } = require('util/types');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure:true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

module.exports.signUp = (Model) =>
  catchAsync(async (req, res, next) => {
    const newUser = await Model.create({
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      name: req.body.name,
      image: req.body.image,
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
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
  //console.log(user);
  //3) send token
  createSendToken(user, 200, res);
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
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
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
  createSendToken(user, 200, res);
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
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token && check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
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

  next();
});
// //
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.kind)) {
//       return next(
//         new AppError('you donot have permission to do this action', 403)
//       );
//     }
//     next();
//   };
// };
exports.getMe = catchAsync(async (req, res, next, popOptoins) => {
  req.params.id = req.user.id;
  Model = req.user.constructor;
  console.log(Model);
  let query = Model.findById(req.params.id);
  if (popOptoins) query = query.populate(popOptoins);
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
