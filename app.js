const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const todoRoutes = require('./routes/todo');
const userRoutes = require('./routes/user');

const app = express();
const port = 3000;

// Parse JSON request body
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Route definitions
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/todos', todoRoutes);
app.use('/posts', postRoutes);



// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
