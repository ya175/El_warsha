const express = require('express');

const router = express.Router();
const customerController = require('./../controllers/customerController');
const authController = require('./../controllers/authController');

router.post('/signup', customerController.signupUser);

module.exports = router;
