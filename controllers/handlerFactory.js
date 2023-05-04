const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.find();
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptoins) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptoins) query = query.populate(popOptoins);
    const doc = await query;
    if (!doc) {
      return next(new AppError('no document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //first way
    // const newTour=  new Tour({}));
    // newTour.save();
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',

      // results: tours.length,
      data: {
        data: doc,
      },
    });
  });
