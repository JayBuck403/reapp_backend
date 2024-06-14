const express = require('express');
//const config = require('config');
const bcrypt = require('bcrypt');
const { validateCompanyAuth } = require('./validation');
const { Company } = require('../models/companies');


const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { error } = await validateCompanyAuth.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return
  }

  let company = await Company.findOne({ email: req.body.email });        // check for Email or phone
  if (!company) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, company.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = company.generateAuthToken();			// set jwtprivatekey as env variable
  res.send(token);

});

module.exports = router;
