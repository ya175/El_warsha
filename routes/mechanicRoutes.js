const express = require('express');
const mechanicController = require('../controllers/mechanicController');

const router = express.Router();

router.post('/signup', mechanicController.signupMechanic);

module.exports = router;
