const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 8, maxlength: 255 },
  profile: { type: String, minlength: 50, maxlength: 500 },
  address: { type: String, required: true },
  region: { type: String, required: true },
  country: {type: String, required: true },
  companyLogo: { type: String },
  companyLicense: { type: String },
  otherDocs: [ {type: String} ],
  isVerified: Boolean,
  propertyCount: {type: Number, min: 0}
});

companySchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, 'jwtPrivateKey', { expiresIn: "7d" });
  return token;
}

const Company = mongoose.model('Company', companySchema);

exports.companySchema = companySchema;
exports.Company = Company;
