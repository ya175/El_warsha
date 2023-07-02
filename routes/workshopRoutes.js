const express = require('express');
const workshopController = require('./../controllers/workshopController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const imagesCloud = require('./../utils/imagesCloud');

const router = express.Router();

router.use('/:workshopId/reviews', reviewRouter); //wheereever you see '/:tourId/reviews' use reviewRouter instead

router.route('/').get(workshopController.getAllWorkshops);
router.route('/:id').get(workshopController.getWorkshopById);

router.route('/').get(workshopController.getAllWorkshops);

router.use(authController.protect);
router.patch(
  '/updateWorkshopProfile',
  imagesCloud.updateImageCover,
  imagesCloud.updateProfileImage,
  authController.updateWorkshopProfile
);

router
  .route('/addToMyTeam/:mechanicId')
  .post(authController.restrictTo('Workshop'), workshopController.addToMyTeam);
module.exports = router;
