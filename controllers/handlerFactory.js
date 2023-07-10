const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.mechanicId) filter = { reviewTarget: req.params.mechanicId };
    else if (req.params.workshopId)
      filter = { reviewTarget: req.params.workshopId };
    const doc = await Model.find(filter);
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
    // const role = Model[0];
    // console.log(role);
    if (popOptoins) query = query.populate(popOptoins);
    // if (popOptoins == 'Work') {
    //   console.log(true);
    query = query.populate('reviews').populate('team').populate('orders');
    // }

    // console.log('NO');
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
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`no document found with that id`, 404));
    }
    res.status(204).json({
      status: 'success',
      message: 'document has been deleted',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //true to return the updated doc rather than the old one
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
