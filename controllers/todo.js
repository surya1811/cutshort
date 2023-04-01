const Todo = require('../models/todo');

exports.createTodo = (req, res) => {
const { title, description } = req.body;
const todo = new Todo({
title,
description,
user: req.user._id,
});
todo.save((err, todo) => {
if (err) {
return res.status(400).json({ error: 'Failed to create todo' });
}
res.json(todo);
});
};

exports.getTodos = (req, res) => {
Todo.find({ user: req.user._id }, (err, todos) => {
if (err || !todos) {
return res.status(400).json({ error: 'Failed to get todos' });
}
res.json(todos);
});
};

exports.getTodoById = (req, res) => {
Todo.findOne({ _id: req.params.id, user: req.user._id }, (err, todo) => {
if (err || !todo) {
return res.status(400).json({ error: 'Todo not found' });
}
res.json(todo);
});
};

exports.updateTodo = (req, res) => {
Todo.findOneAndUpdate(
{ _id: req.params.id, user: req.user._id },
req.body,
{ new: true },
(err, todo) => {
if (err || !todo) {
return res.status(400).json({ error: 'Failed to update todo' });
}
res.json(todo);
}
);
};

exports.deleteTodo = (req, res) => {
Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id }, (err, todo) => {
if (err || !todo) {
return res.status(400).json({ error: 'Failed to delete todo' });
}
res.json({ message: 'Todo deleted successfully' });
});
};