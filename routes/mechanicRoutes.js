const express = require('express');
const mechanicController = require('../controllers/mechanicController');

const router = express.Router();

router.post('/signup', mechanicController.signupMechanic);

router.route('/').get(mechanicController.getAllMechanics);
module.exports = router;
