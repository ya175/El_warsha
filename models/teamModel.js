const mongoose = require('mongoose');
const Customer = require('./customerModel');
const Workshop = require('./workshopModel');
const Mechanic = require('./mechanicModel');

const teamSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    workshop: {
      type: mongoose.Schema.ObjectId,
      ref: 'Workshop',
      required: true,
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mechanic',
      required: true,
    },
  },
  {
    //this make sure that where ever you has property that is not saved (claculated) it will be selected when ever yououtput them
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
