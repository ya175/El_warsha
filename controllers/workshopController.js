const Workshop = require('./../models/workshopModel');
const Team = require('./../models/teamModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const authController = require('./authController');
const Review = require('../models/reviewModel');

// exports.getAllWorkshops = factory.getAll(Workshop);

// exports.getWorkshopById = factory.getOne(Workshop);
// const Workshop = require('./workshopModel');
// const Review = require('./reviewModel');

exports.getAllWorkshops = catchAsync(async (req, res, next) => {
  try {
    const workshops = await Workshop.find();
    const workshopIds = workshops.map((workshop) => workshop._id);
    const reviews = await Review.find({ reviewTarget: { $in: workshopIds } });
    const averageRatings = await Review.aggregate([
      {
        $match: {
          reviewTarget: { $in: workshopIds },
        },
      },
      {
        $group: {
          _id: '$reviewTarget',
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const workshopsWithReviews = workshops.map((workshop) => {
      const workshopReviews = reviews.filter(
        (review) => review.reviewTarget.toString() === workshop._id.toString()
      );
      const averageRatingObject = averageRatings.find(
        (averageRating) =>
          averageRating._id.toString() === workshop._id.toString()
      );
      return {
        ...workshop.toObject(),
        reviews: workshopReviews,
        averageRating: averageRatingObject
          ? averageRatingObject.averageRating
          : null,
      };
    });

    res.status(200).json({ data: workshopsWithReviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// app.listen(3000, () => console.log('Server started on port 3000'));

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
      // averageRating,
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
