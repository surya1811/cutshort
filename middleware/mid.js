const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const { _id } = decoded;
    User.findById(_id)
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
      });
  });
};

module.exports = authMiddleware;
