const carController = require('./../controllers/carController');
const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('./../controllers/authController');
// const factory = require('./../controllers/handlerFactory');

router.use(authController.protect);
router.use(authController.restrictTo('Customer'));

router.route('/').post(carController.setUserIds, carController.addMyCar);
router.route('/:id').patch(carController.setUserIds, carController.updateMyCar);

//later
router
  .route('/addAgentData/:id')
  .post(carController.setUserIds, carController.addAgentData);

// router
// .route('/addCarData')
// .post(
//   carController.setUserIds,
//   carController.addMyCar,
//   carController.follwAgent,
//   carController.addAgentData
// );

module.exports = router;
