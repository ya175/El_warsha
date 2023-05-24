const mongoose = require('mongoose');
const Customer = require('./customerModel');
const Workshop = require('./workshopModel');
const Mechanic = require('./mechanicModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please enter a review'],
    },
    rating: {
      type: Number,
      required: [true, 'Please enter rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'review must have an author'],
    },
    reviewAbout: {
      type: String,
      enum: ['Workshop', 'Mechanic'],
      required: true,
    },
    reviewTarget: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reviewAbout',
      required: true,
    },
  },
  {
    //this make sure that where ever you has property that is not saved (claculated) it will be selected when ever yououtput them
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviewTarget',
    select: 'name',
  }).populate({
    path: 'customer',
    select: 'fName image',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
