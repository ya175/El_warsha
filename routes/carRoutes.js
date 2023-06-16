const carController = require('./../controllers/carController');
const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('./../controllers/authController');
// const factory = require('./../controllers/handlerFactory');

router.use(authController.protect);
router.use(authController.restrictTo('Customer'));

router.route('/').post(carController.setUserIds, carController.addMyCar);
router
  .route('/addAgentData/:id')
  .post(carController.setUserIds, carController.addAgentData);

router.route('/:id').patch(carController.setUserIds, carController.updateMyCar);
module.exports = router;
