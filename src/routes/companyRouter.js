const mongoose = require('mongoose');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { Company, companySchema } = require('../models/companies');
const { validateCompanySchema } = require('./validation');

const router = express.Router();

// Get all companies

router.get('/', async (req, res) => {
  const allCompanies = await Company.find({}, {password: 0, confirmPassword: 0, companyLicense: 0, otherDocs: 0});
  res.send(allCompanies);
});

// Register company

router.post('/', async (req, res) => {
  try {
    const { error } = await validateCompanySchema.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return
  }

  let companyAlreadyRegistered = await Company.findOne({ email: req.body.email });	// check for Email or phone
  if (companyAlreadyRegistered) return res.status(400).send("Company already registered.");

  let newCompany = new Company(_.pick(req.body, ['name', 'email',
    					       'phone', 'password',
    					       'confirmPassword', 'profile',
					       'address', 'region',
					       'country', 'companyLogo',
   					       'companyLicense', 'otherDocs',
    					       'isVerified']));

  const salt = await bcrypt.genSalt(10);
  newCompany.password = await bcrypt.hash(newCompany.password, salt)
  newCompany = await newCompany.save();

  const token = newCompany.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(newCompany, ['_id', 'name', 
	  						     'email', 'phone', 
	  						     'profile', 'location',
  							     'region', 'country',
  							     'companyLogo', 'companyLicense',
  							     'otherDocs','isverified']));
});

// Get specific company
router.get('/:_id', async (req, res) => {
  const company = await Company.findById(req.params._id);
  !company ? res.status(404).send('The specified resource was not found') : res.send(company);
});

router.put('/:_id', async (req, res) => {
  try {
    const { error } = await validateCompanySchema.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return
  }
    const company = await Company.findByIdAndUpdate(req.params._id, {
      name: req.body.name,
      profile: req.body.profile,
      address: req.body.address,
      region: req.body.region,
      country: req.body.country,
      companyLogo: req.body.companyLogo,
      companyLicense: req.body.companyLicense,
      otherDocs: req.body.otherDocs,
      isVerified: req.body.isVerified,
  }, { new: true });
  !company ? res.status(404).send('The specified resource was not found') : res.send(company);
});

router.delete('/:_id', async (req, res) => {
  const company = await Company.findByIdAndRemove(req.params._id)
  !company ? res.status(404).send('The specified resource was not found') : res.send(company);
});

module.exports = router;
