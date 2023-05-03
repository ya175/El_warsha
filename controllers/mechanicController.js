const Mechanic = require('./../models/mechanicModel');
const authController = require('./authController');

exports.signupMechanic = authController.signUp(Mechanic);
