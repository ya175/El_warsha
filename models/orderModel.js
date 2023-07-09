const mongoose = require('mongoose');
const Customer = require('./customerModel');
const Workshop = require('./workshopModel');
const Mechanic = require('./mechanicModel');

const orderSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'order must have an author'],
    },
    orderTo: {
      type: String,
      enum: ['Workshop', 'Mechanic'],
      required: true,
    },
    orderTarget: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'orderTo',
      required: true,
    },
    problem: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  {
    //this make sure that where ever you has property that is not saved (claculated) it will be selected when ever yououtput them
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
