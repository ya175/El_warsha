const factory = require('./handlerFactory');
const Review = require('./../models/reviewModel');

exports.setToursUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
