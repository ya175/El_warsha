const express = require('express');
const workshopController = require('./../controllers/workshopController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', workshopController.signupWorkshop);
router.route('/').get(workshopController.getAllWorkshops);
router.route('/:id').get(workshopController.getWorkshopById);

router.route('/').get(workshopController.getAllWorkshops);

router.use(authController.protect);
module.exports = router;
