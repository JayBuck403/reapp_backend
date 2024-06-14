const express = require('express');
const _ = require('lodash');
//const config = require('config');
const bcrypt = require('bcrypt');
const { validateUserAuth } = require('./validation');
const { User } = require('../models/users');
const auth = require('../middlewares/authMiddleware');


const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { error } = await validateUserAuth.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return
  }

  let user = await User.findOne({ email: req.body.email });        // check for Email or phone
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();                        // set jwtprivatekey as env variable

  res.header('Access-Control-Expose-Headers', 'x-auth-token');
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'avatar', 'phone', 'createdAt', 'updatedAt']));

});

router.post('/google_auth', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    
    if (user) {
      const token = user.generateAuthToken();
      res.header('Access-Control-Expose-Headers', 'x-auth-token');
      res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'avatar', 'phone', 'createdAt', 'updatedAt']));
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedGenPassword = await bcrypt.hash(generatedPassword, 10);
      let newUser = new User({name: req.body.name, email: req.body.email, password: hashedGenPassword, confirmPassword: hashedGenPassword, phone: "+233", avatar: req.body.photo});
      newUser = await newUser.save();
      const token = newUser.generateAuthToken();
      res.header('Access-Control-Expose-Headers', 'x-auth-token');
      res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'avatar', 'phone', 'createdAt', 'updatedAt']));
    }
    
  } catch (error) {
	console.log(error)			// fix proper
  }
})

module.exports = router;
