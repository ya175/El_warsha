const carController = require('./../controllers/carController');
const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('./../controllers/authController');
// const factory = require('./../controllers/handlerFactory');

router.use(authController.protect);

router.route('/').post(carController.setUserIds, carController.addMyCar);
module.exports = router;
