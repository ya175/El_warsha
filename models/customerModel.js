const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const customerSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: [true, 'name is required'],
    },

    lName: {
      type: String,
      required: [true, 'name is required'],
    },
    role: {
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

    image: {
      type: String,
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
customerSchema.virtual('cars', {
  ref: 'Car',
  foreignField: 'customer',
  localField: '_id',
});

customerSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

customerSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

customerSchema.pre('save', function (next) {
  if (this.isNew) this.role = 'Customer';
  next();
});
customerSchema.methods.correctMyPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

customerSchema.methods.createPasswordResetToken = function () {
  // 1)create a new password reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //2)encrypt the password reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 100 * 60 * 1000; //

  return resetToken;
};

customerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

const Customer = mongoose.model('Customer', customerSchema); //(key,)
module.exports = Customer;
