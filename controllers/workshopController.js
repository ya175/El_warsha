const Workshop = require('./../models/workshopModel');
const Team = require('./../models/teamModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const authController = require('./authController');
const Review = require('../models/reviewModel');

exports.getAllWorkshops = factory.getAll(Workshop);

// exports.getWorkshopById = factory.getOne(Workshop);

exports.getWorkshopById = catchAsync(async (req, res, next) => {
  let query = Workshop.findById(req.params.id);
  // if (popOptoins) query = query.populate(popOptoins);
  query = query.populate('reviews');
  const doc = await query;
  if (!doc) {
    return next(new AppError('هذه الورشه غير موجودة', 404));
  }
  const averageRating = await Review.aggregate([
    {
      $match: {
        reviewTarget: doc._id,
      },
    },
    {
      $group: {
        _id: '$reviewTarget',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(averageRating);
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
      averageRating,
    },
  });
});

exports.addToMyTeam = catchAsync(async (req, res, next) => {
  req.body.workshop = req.user._id;
  req.body.mechanic = req.params.mechanicId;
  const newTeam = await Team.create(req.body);
  res.status(200).json({
    status: 'success',
    data: newTeam,
  });
});

exports.aggregateWorkshop = catchAsync(async (req, res, next) => {
  Workshop.aggregate(
    [
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'workshopId',
          as: 'reviews',
        },
      },
      {
        $project: {
          name: 1,
          averageRating: { $avg: '$reviews.rating' },
        },
      },
    ],
    function (err, result) {
      if (err) {
        console.log(err);
        return;
      }

      console.log(result);
    }
  );
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
