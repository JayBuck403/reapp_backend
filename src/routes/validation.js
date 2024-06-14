const Joi = require("joi");

const validatePropertySchema = Joi.object({
  title: Joi.string().min(5).required(),
  type: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.string().min(0).required(),
  currency: Joi.string().required(),
  negotiable: Joi.boolean(),
  bedrooms: Joi.number().min(0),
  bathrooms: Joi.number().min(0),
  amenities: Joi.array().items(Joi.string()),
  area: Joi.number(),
  unit: Joi.string(),
  country: Joi.string(),
  region: Joi.string(),
  landmarks: Joi.string().required(),
  companyRef: Joi.object(),
  companyLogo: Joi.string(),
  imageUrls: Joi.array().items(Joi.string()),
  isAvailable: Joi.boolean(),
  propertyLocation: Joi.string().required(),
  viewsCount: Joi.number()
});

const validateCompanySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  phone: Joi.string().required(),
  password: Joi.string().min(8).max(255).required(),
  confirmPassword: Joi.string().min(8).max(255).required(),
  profile: Joi.string().min(50).max(500),
  address: Joi.string().required(),
  country: Joi.string().required(),
  region: Joi.string().required(),
  companyLogo: Joi.string(),
  companyLicense: Joi.string(),
  otherDocs: Joi.array().items(Joi.string()),
  isVerified: Joi.boolean()
});

const validateUserSchema = Joi.object({
  name: Joi.string().min(3).max(25).required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  password: Joi.string().min(8).max(255).required(),
  confirmPassword: Joi.string().min(8).max(255).required(),
  phone: Joi.string().required(),
  avatar: Joi.string(),
  isActivated: Joi.boolean(),
  listingActivationDays: Joi.number(),
});

const validateCompanyAuth = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  password: Joi.string().min(8).max(255).required(),
});

const validateUserAuth = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  password: Joi.string().min(8).max(255).required(),
});

exports.validatePropertySchema = validatePropertySchema;
exports.validateCompanySchema = validateCompanySchema;
exports.validateUserSchema = validateUserSchema;
exports.validateCompanyAuth = validateCompanyAuth;
exports.validateUserAuth = validateUserAuth;
