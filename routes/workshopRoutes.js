const express = require('express');
const workshopController = require('./../controllers/workshopController');

const router = express.Router();

router.post('/signup', workshopController.signupWorkshop);
router.route('/').get(workshopController.getAllWorkshops);
router.route('/:id').get(workshopController.getWorkshop);

router.route('/').get(workshopController.getAllWorkshops);
module.exports = router;
