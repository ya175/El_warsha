const factory = require('./handlerFactory');
const Car = require('./../models/carModel');
// add my car

exports.setUserIds = (req, res, next) => {
  if (!req.body.customer) req.body.customer = req.user.id;
  if (!req.body.reviewAbout) {
    if (req.params.mechanicId) req.body.reviewAbout = 'Mechanic';
    else req.body.reviewAbout = 'Workshop';
  }

  next();
};
exports.addMyCar = factory.createOne(Car);

//get my car
