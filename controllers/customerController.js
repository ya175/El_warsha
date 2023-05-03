const Customer = require('./../models/customerModel');
const Workshop = require('./../models/workshopModel');
const catchAsync = require('./../utils/catchAsync');

const authController = require('./authController');

exports.signupUser = authController.signUp(Customer);
