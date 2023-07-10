const mongoose = require('mongoose');

const Productschema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    // tradeMark : {type:String , required:true },
    // madeIn : {type:String , required:true },
    // productStatus : {type:String , required:true },
    matchedDevices: { type: String, required: true },
    discount: { type: String },
    avilability: {
      type: Boolean,
      default: true,
    },
    color: { type: String },
    price: { type: Number, required: true },
    categories: { type: Array }, //tradeMark,madeIn,productStatus
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', Productschema);
