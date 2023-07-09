const express = require('express');
const router = express.Router();
const customerController = require('./../controllers/customerController');
const authController = require('./../controllers/authController');
const factory = require('./../controllers/handlerFactory');
const orderController = require('./../controllers/orderController');
const imagesCloud = require('./../utils/imagesCloud');

router.use(authController.protect);

router.patch(
  '/updateCustomerProfile',
  imagesCloud.updateProfileImage,
  authController.updateCustomerProfile
);

router
  .route('/:id/order')
  .post(
    authController.restrictTo('Customer'),
    orderController.setAboutUserIds,
    orderController.addOrder
  );

module.exports = router;
