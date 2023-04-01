const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 128,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Todo', todoSchema);
