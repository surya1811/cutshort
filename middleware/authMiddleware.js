const User = require("../models/user");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { authFindByTodoId } = require("../controllers/todo");
const { authFindById } = require("../controllers/post");
const rateLimit = require('express-rate-limit');

// rate limiter middleware to limit the number of requests
exports.accessTokenRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: "Too many requests, please try again in 5 minutes.",
  headers: true,
  onLimitReached: function(req, res) {
    res.set('Retry-After', 5*60*1000); //5 Minutes
    console.log(`Rate limit exceeded for IP ${req.ip} at ${new Date().toLocaleTimeString()}`);
  },
});

exports.userRegistrationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests, please try again in 1 minutes.",
  headers: true,
  onLimitReached: function(req, res) {
    res.set('Retry-After', 1*60*1000); //1 Minutes
    console.log(`Rate limit exceeded for IP ${req.ip} at ${new Date().toLocaleTimeString()}`);
  },
});

  exports. authenticateUser = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {

        return res.status(401).send("Invalid token");
      }
      req.user = decoded;
      next(); // call next middleware
    })
  }

  exports.authenticateEditTodo = async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const todoId = req.params.todoId;
      const todo = await authFindByTodoId(todoId)
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (decoded.role === 'admin' || todo.user.toString() === decoded._id) {
        req.user =todo.user;
        next();
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  };
  

  exports.authenticateEditPost = async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const postId = req.params.postId;
      console.log(postId);
      const post = await authFindById(postId);
      console.log(post.postedBy._id.toString());
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log(decoded);
      if (decoded.role === 'admin' || post.postedBy._id.toString() === decoded._id) {
        console.log("successful")
        req.user = post.postedBy;
        next();
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  };
  