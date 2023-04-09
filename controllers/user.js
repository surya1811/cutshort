const User =require('../models/user');

exports.getUserById =async (req, res) => {
    try{
const user=await User.findById(req.params.userId)
if ( !user) {
return res.status(400).json({ error: 'User not found' });
}
const { name, email } = user;
res.json({ _id: user._id, name, email });
}catch(err){
    return res.status(500).json({ error: err.message });
}
};

exports.searchUsers = async (req, res) => {
    try {
      const query = req.params.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const users = await User.find({
        $or: [
          { name: { $regex: `.*${query}.*`, $options: "i" } },
          { email: { $regex: `.*${query}.*`, $options: "i" } },
        ],
      })
        .skip((page - 1) * limit)
        .limit(limit);
  
      const count = await User.countDocuments({
        $or: [
          { name: { $regex: `.*${query}.*`, $options: "i" } },
          { email: { $regex: `.*${query}.*`, $options: "i" } },
        ],
      });
  
      if (!users) {
        return res.status(400).json({ error: "Failed to search users" });
      }
  
      res.json({
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        users,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
  

exports.addPostComment = (req, res) => {
const { text } = req.body;
const comment = { text, postedBy: req.user._id };
User.findByIdAndUpdate(
req.params.userId,
{ $push: { postComments: comment } },
{ new: true, select: '_id name email postComments' },
(err, user) => {
if (err || !user) {
return res.status(400).json({ error: 'Failed to add post comment' });
}
res.json(user);
}
);
};