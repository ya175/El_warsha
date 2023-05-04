const Mechanic = require('./../models/mechanicModel');
const authController = require('./authController');
const factory = require('./handlerFactory');

exports.signupMechanic = authController.signUp(Mechanic);
exports.getAllMechanics = factory.getAll(Mechanic);
exports.getOneMechanicById = factory.getOne(Mechanic);
