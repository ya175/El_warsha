const Order = require('./../models/orderModel');
const catchAsync = require('./../utils/catchAsync');

exports.setAboutUserIds = (req, res, next) => {
  //set workshop or mechanic id
  if (!req.body.orderTarget)
    req.body.orderTarget = req.params.workshopId || req.params.mechanicId;
  //set customer id
  if (!req.body.customer) req.body.customer = req.user.id;

  if (!req.body.orderTo) {
    if (req.params.mechanicId) req.body.reviewAbout = 'Mechanic';
    else req.body.reviewAbout = 'Workshop';
  }
  next();
};
exports.addOrder = catchAsync(async (req, res, next) => {
  const newOrder = await Order.create(req.body);

  res.status(200).json({
    status: 'success',
    data: newOrder,
  });
});
