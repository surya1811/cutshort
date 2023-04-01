const Post = require('../models/post');

exports.createPost = (req, res) => {
  const { text } = req.body;
  const post = new Post({ text, postedBy: req.user._id });
  post.save((err, post) => {
    if (err) {
      return res.status(400).json({ error: 'Failed to create post' });
    }
    res.json(post);
  });
};

exports.getPosts = (req, res) => {
  Post.find()
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to get posts' });
      }
      res.json(posts);
    });
};

exports.getPostById = (req, res) => {
  Post.findById(req.params.id)
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({ error: 'Post not found' });
      }
      res.json(post);
    });
};

exports.deletePost = (req, res) => {
  Post.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id }, (err, post) => {
    if (err || !post) {
      return res.status(400).json({ error: 'Failed to delete post' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
};

exports.addComment = (req, res) => {
  const { text } = req.body;
  const comment = { text, postedBy: req.user._id };
  Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: comment } },
    { new: true, populate: 'comments.postedBy', populateSelect: '_id name' },
    (err, post) => {
      if (err || !post) {
        return res.status(400).json({ error: 'Failed to add comment' });
    }
    res.json(post);
  }
  );
};