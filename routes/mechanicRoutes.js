const express = require('express');
const mechanicController = require('./../controllers/mechanicController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', mechanicController.signupMechanic);

router.route('/').get(mechanicController.getAllMechanics);
router.route('/:id').get(mechanicController.getOneMechanicById);

router.use(authController.protect);

module.exports = router;
