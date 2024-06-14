const { companySchema, Company } = require('./companies');

const mongoose = require('mongoose');


const propertySchema = new mongoose.Schema({
  title: {type: String, required: true, minlength: 5, maxlength: 50},
  type: {type: String, required: true},
  category: {type: String, required: true},
  description: {type: String, required: true},
  price: {type :String, required: true, min: 0},
  currency: String,
  negotiable: Boolean,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [ {type: String} ],
  area: Number,
  unit: String,
  propertyLocation: {type: String, required: true},
  landmarks: {type: String, required: true},
  country: String,
  region: {type: String, required: true},
  companyRef: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  isVerified: Boolean,
  imageUrls: [ {type: String, required: true} ],
  isAvailable: Boolean,
  viewsCount: {type: Number, min: 0},
}, {timestamps: true});

const Property = mongoose.model('Property', propertySchema);

exports.propertySchema = propertySchema;
exports.Property = Property;
