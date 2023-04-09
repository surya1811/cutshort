const Post = require('../models/post');

exports.createPost =async (req, res) => {
  const { title,body } = req.body;
  try{
  const post = new Post({ 
    title,
    body,
    postedBy: req.user._id });
  const savedPost=await post.save();
  res.status(201).json(savedPost);
  }catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res) => {
  const PAGE_SIZE = parseInt(req.query.limit) || 10; // Number of posts to be displayed per page
  const page = parseInt(req.query.page) || 1; // Current page number

  try {
    const userId = req.user._id;
    const totalPosts = await Post.countDocuments({ postedBy: userId });
    const totalPages = Math.ceil(totalPosts / PAGE_SIZE);
    const skipPosts = PAGE_SIZE * (page - 1);

    const posts = await Post.find({ postedBy: userId })
      .populate('postedBy', '_id name')
      .populate('comments.postedBy', '_id name')
      .sort({ createdAt: -1 })
      .skip(skipPosts)
      .limit(PAGE_SIZE)
      .exec();

    res.json({ posts, totalPages, currentPage: page });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getPostById = async (req, res) => {
  try{
  const post= await Post.findById(req.params.postId)
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .exec();
    res.json(post);
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.authFindById = async (postId) => {
  try{
    const post= await Post.findById(postId)
      .populate('postedBy', '_id name')
      .populate('comments.postedBy', '_id name')
      .exec();
    return post;
  } catch(err) {
    throw new Error(err.message);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: req.body },
      { new: true }
    );
    if (!post) {
      return res.status(400).json({ error: 'Failed to update post' });
    }
    res.json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.deletePost =async (req, res) => {
  try{
 const post= await Post.findByIdAndDelete({ _id: req.params.postId, postedBy: req.user._id })
 console.log(post);
    if (!post) {
      return res.status(400).json({ error: 'Failed to delete post' });
    }
    res.json({ message:   `Post deleted successfully of postid :${req.params.postId} and userid :${req.user._id}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addComment =async (req, res) => {
  try{
  const { text } = req.body;
  const comment = {
     text,
      postedBy: req.user._id };
  const post=await Post.findByIdAndUpdate(
    req.params.postId,
    { $push: { comments: comment } },
    { new: true, populate: 'comments.postedBy', populateSelect: '_id name' })
      if (!post) {
        return res.status(400).json({ error: 'Failed to add comment' });
    }
    res.json(post);    
  }catch (err) {
    return res.status(500).json({ error: err.message });
  }
};