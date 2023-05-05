const factory = require('./handlerFactory');
const Review = require('./../models/reviewModel');

exports.setAboutUserIds = (req, res, next) => {
  if (!req.body.reviewTarget)
    req.body.reviewTarget = req.params.workshopId || req.params.mechanicId;
  if (!req.body.customer) req.body.customer = req.user.id;
  if (!req.body.reviewAbout) {
    if (req.params.mechanicId) req.body.reviewAbout = 'Mechanic';
    else req.body.reviewAbout = 'Workshop';
  }

  next();
};
exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReviewById = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
