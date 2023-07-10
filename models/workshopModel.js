const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const workshopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, 'ادخل اسم الورشه '],
    },
    fName: {
      type: String,
      required: [true, 'name is required'],
    },
    rolle: {
      type: String,
    },
    description: {
      type: String,
    },
    lName: {
      type: String,
      required: [true, 'name is required'],
    },
    image: {
      type: String,
      // default: 'default.jpg',
    },
    averageRating: {
      type: Number,
    },

    imageCover: {
      type: String,
    },
    // team: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Mechanic',
    //   },
    // ],
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
      required: [true, ' email is required'],
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, 'please enter a valid email'],
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, 'Please enter a valid password'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      requird: [true, 'Please enter a valid password'],
      validate: {
        //work only when SAVE,CREATE
        validator: async function (el) {
          return el === this.password;
        },
        message: 'passwords are not the same',
      },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
  },
  {
    //this make sure that where ever you has property that is not saved (claculated) it will be selected when ever yououtput them
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
workshopSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'reviewTarget',
  localField: '_id',
});

workshopSchema.virtual('orders', {
  ref: 'Order',
  foreignField: 'orderTarget',
  localField: '_id',
});

workshopSchema.virtual('team', {
  ref: 'Team',
  foreignField: 'workshop',
  localField: '_id',
});

// workshopSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'team',
//     select: 'name image specialization',
//   });
//   next();
// });

workshopSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

workshopSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

workshopSchema.pre('save', function (next) {
  if (this.isNew) this.rolle = 'Workshop';
  next();
});
workshopSchema.methods.correctMyPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

workshopSchema.methods.createPasswordResetToken = function () {
  // 1)create a new password reset atoken
  const resetToken = crypto.randomBytes(32).toString('hex');

  //2)encrypt the password reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 100 * 60 * 1000; //

  return resetToken;
};

workshopSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
    // console.log(this.passwordChangedAt, JWTTimestamp);
  }
  return false;
};

workshopSchema.statics.calculateAverageraing = async function (workshopId) {
  this.averageRating = await Review.aggregate([
    {
      $match: {
        workshopId: { $in: workshopIds },
      },
    },
    {
      $group: {
        _id: '$workshopId',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
};

const Workshop = mongoose.model('Workshop', workshopSchema);
module.exports = Workshop;
