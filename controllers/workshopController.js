const Workshop = require('./../models/workshopModel');
const Team = require('./../models/teamModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const authController = require('./authController');
const Review = require('../models/reviewModel');

exports.getAllWorkshops = factory.getAll(Workshop);

exports.getWorkshopById = factory.getOne(Workshop);

exports.addToMyTeam = catchAsync(async (req, res, next) => {
  req.body.workshop = req.user._id;
  req.body.mechanic = req.params.mechanicId;
  const newTeam = await Team.create(req.body);
  res.status(200).json({
    status: 'success',
    data: newTeam,
  });
});

// exports.addToMyTeam = catchAsync(async (req, res, next) => {
//   const mechanicId = req.params.mechanicId;

//   const currentWorkshop = await Workshop.findOne(req.user._id);
//   currentWorkshop.team.push(mechanicId);
//   await currentWorkshop.save();
//   console.log(req.user._id);
//   console.log(mechanicId);

//   res.status(200).json({
//     status: 'success',
//     data: currentWorkshop,
//   });
// });
