const Workshop = require('./../models/workshopModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const authController = require('./authController');
const Review = require('../models/reviewModel');

exports.signupWorkshop = authController.signUp(Workshop);

exports.getAllWorkshops = factory.getAll(Workshop);
exports.getWorkshopById = factory.getOne(Workshop, { path: 'review' });
