const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('Customer'),
    reviewController.setAboutUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo('Customer'),
    authController.restrictToItsCreator,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('Customer'),
    authController.restrictToItsCreator,
    reviewController.deleteReview
  );

module.exports = router;
