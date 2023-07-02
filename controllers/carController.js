const factory = require('./handlerFactory');
const Car = require('./../models/carModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// add my car

exports.setUserIds = (req, res, next) => {
  if (!req.body.customer) req.body.customer = req.user.id;

  next();
};

exports.addMyCar = factory.createOne(Car);
exports.updateMyCar = factory.updateOne(Car);

exports.follwAgent = async (req, res, next) => {
  if (await Car.find({ id: req.user.id, followAgency: true })) {
    console.log(`follow Agency: ${followAgency}`);
    next();
  }
};

exports.addAgentData = catchAsync(async (req, res, next) => {
  const doc = await Car.findByIdAndUpdate(
    req.params.id,
    {
      agencyName: req.body.agencyName,
      agencyAddress: req.body.agencyAddress,
      agencyPhoneNumber: req.body.agencyPhoneNumber,
    },
    {
      new: true, //true to return the updated doc rather than the old one
      runValidators: true,
    }
  );
  if (!doc) {
    return next(new AppError('no document found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
});

//get my car
