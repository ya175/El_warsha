const express = require('express');
const mechanicController = require('./../controllers/mechanicController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const imagesCloud = require('./../utils/imagesCloud');

const router = express.Router();

router.use('/:mechanicId/reviews', reviewRouter); //wheereever you see '/:tourId/reviews' use reviewRouter instead

router.route('/').get(mechanicController.getAllMechanics);
router.route('/:id').get(mechanicController.getOneMechanicById);

router.use(authController.protect);
router.patch(
  '/updateMechanicProfile',

  imagesCloud.updateMechanicProfileImage,
  authController.updateMechanicProfile
);
module.exports = router;
