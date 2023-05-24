const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'please enter the car owner id'],
  },
  brand: {
    type: String,
    required: [true, 'car brand is required'],
  },
  yearModel: {
    type: String,
    required: [true, 'car year is required'],
  },
  engineCapacity: {
    type: String,
    required: [true, 'engine capacity is required'],
  },
  enginePower: {
    type: String,
  },
  bodyType: {
    type: String,
    required: [true, 'body type is required'],
  },
  followAgency: {
    type: Boolean,
    required: [true, 'agency is required'],
  },
  agencyName: String,
  agencyAddress: String,
  agencyPhoneNumber: String,
  carPhoto: String,
  mainCar: {
    type: Boolean,
    default: true,
  },
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
