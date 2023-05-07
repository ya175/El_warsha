const express = require('express');

const router = express.Router();
const cors = require('cors');
const customerController = require('./../controllers/customerController');
const authController = require('./../controllers/authController');

const factory = require('./../controllers/handlerFactory');

const Workshop = require('./../models/workshopModel');
const Customer = require('./../models/customerModel');
const Mechanic = require('./../models/mechanicModel');

router.post('/forgotpassword', authController.forgotPassword);
router.post('/login', cors(), authController.logIn);
router.post('/signup', authController.signUp);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //will protect all routes coming after it

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', authController.getMe);

module.exports = router;
