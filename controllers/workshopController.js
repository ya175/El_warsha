const Workshop = require('./../models/workshopModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const authController = require('./authController');

exports.signupWorkshop = authController.signUp(Workshop);

exports.getAllWorkshops = factory.getAll(Workshop);
exports.getWorkshopById = factory.getOne(Workshop);
