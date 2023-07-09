const Mechanic = require('../models/mechanicModel');
const Workshop = require('../models/workshopModel');
const Order = require('./../models/orderModel');
const catchAsync = require('./../utils/catchAsync');

exports.setAboutUserIds = catchAsync(async (req, res, next) => {
  //set workshop or mechanic id
  if (!req.body.orderTarget) req.body.orderTarget = req.params.id;
  //set customer id
  if (!req.body.customer) req.body.customer = req.user.id;
  if (!req.body.orderTo) {
    const ordertoUser =
      (await Workshop.findById(req.params.id)) ||
      (await Mechanic.findById(req.params.id));

    req.body.orderTo = ordertoUser.rolle;
    console.log(req.body.orderTo);
  } else {
    return next(new AppError('اختر الورشه من فضلك'));
  }
  next();
});

exports.addOrder = catchAsync(async (req, res, next) => {
  const newOrder = await Order.create(req.body);

  res.status(200).json({
    status: 'success',
    data: newOrder,
  });
});
