const User =require('../models/user');

exports.getUserById = (req, res) => {
User.findById(req.params.id, (err, user) => {
if (err || !user) {
return res.status(400).json({ error: 'User not found' });
}
const { name, email } = user;
res.json({ _id: user._id, name, email });
});
};

exports.searchUsers = (req, res) => {
const query = req.query.q;
User.find({ name: { $regex: query, $options: 'i' } }, (err, users) => {
if (err) {
return res.status(400).json({ error: 'Failed to search users' });
}
res.json(users);
});
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