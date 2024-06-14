const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 25 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8, maxlength: 255 },
  confirmPassword: { type: String, required: true, minlength: 8, maxlength: 255 },
  phone: { type: String, required: true },
  avatar: { type: String, default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" },
  userIpAddress: { type: String },
  isRegistered: Boolean,
  isActivated: { type: Boolean, default: false },
  listingActivationDays: { type: Number, default: 0 }
}, {timestamps: true});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, 'jwtPrivateKey');
  return token;
}

const User = new mongoose.model("User", userSchema);

exports.userSchema = userSchema;
exports.User = User;
