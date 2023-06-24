const express = require('express');

const router = express.Router();
const customerController = require('./../controllers/customerController');
const authController = require('./../controllers/authController');
const factory = require('./../controllers/handlerFactory');
const imagesCloud = require('./../utils/imagesCloud');

const Workshop = require('./../models/workshopModel');
const Customer = require('./../models/customerModel');
const Mechanic = require('./../models/mechanicModel');

// var whitelist = ['https://el-warsha-zymi.onrender.com/', '127.0.0.1:5000/'];
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };
router.post('/forgotpassword', authController.forgotPassword);
router.post('/login', authController.logIn);

router.post(
  '/signup',
  imagesCloud.uploadeProfileImage,
  // images.uploadeProfileImage,
  authController.signUp
);

router.post(
  '/signup_',
  // imagesCloud.uploadeProfileImage,
  // images.uploadeProfileImage,
  authController.signUp
);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //will protect all routes coming after it

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', authController.getMe);

// router.post('/uploadImage', images.uploadeProfileImage);
// router.post('/uploadImages', imagesCloud.uploadeImageCover);
module.exports = router;
