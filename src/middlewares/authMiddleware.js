const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied');

  try {
    const decoded = jwt.verify(token, 'jwtPrivateKey');				// set privateKey in .env file
    req.user = decoded;
    next();
  }
  catch (error) {
    res.status(400).send('Invalid token');
  }
}
