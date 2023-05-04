const Customer = require('./../models/customerModel');
const Workshop = require('./../models/workshopModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const authController = require('./authController');

exports.signupUser = authController.signUp(Customer);
exports.getOneCustomerById = factory.getOne(Customer);
