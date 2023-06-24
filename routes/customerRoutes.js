const express = require('express');
const router = express.Router();
const customerController = require('./../controllers/customerController');
const authController = require('./../controllers/authController');
const factory = require('./../controllers/handlerFactory');
const imagesCloud = require('./../utils/imagesCloud');

router.use(authController.protect);
router.patch(
  '/updateCustomerProfile',
  imagesCloud.updateProfileImage,
  authController.updateCustomerProfile
);

module.exports = router;
