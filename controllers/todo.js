const Todo = require('../models/todo');
const jwt = require('jsonwebtoken'); 
const express = require('express');
const app = express();
app.use(express.json());


exports.createTodo = async (req, res, next) => {
  const { title, description } = req.body;
  try {
    const todo = new Todo({
      title,
      description,
      user: req.user._id,
    });
    const savedtodo = await todo.save();
    res.status(201).json(savedtodo);
  } catch (err) {
    next(err);
  }
};


exports.getTodos = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const todos = await Todo.find({ user: req.user._id })
      .limit(limit)
      .skip(startIndex)
      .exec();

    const count = await Todo.countDocuments({ user: req.user._id });

    if (todos.length === 0) {
      return res.status(404).json({ message: "No todos found" });
    }

    const pagination = {};

    if (endIndex < count) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({ todos, pagination });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getTodoById = async (req, res) => {
    try{
const todo=await Todo.findOne({ _id: req.params.todoId })
if ( !todo) {
return res.status(400).json({ error: 'Todo not found' });
}
res.json(todo);
    }catch(err){
        return res.status(500).json({ error: err.message });
  
    }
};

exports.authFindByTodoId = async (todoId) => {
  try{
    const todo= await Todo.findById(todoId)
    return todo;
  } catch(err) {
    throw new Error(err.message);
  }
};

exports.updateTodo = async (req, res) => {
const todo=await Todo.findOneAndUpdate(
{_id: req.params.todoId, user: req.user._id },
req.body,
{ new: true })
if ( !todo) {
return res.status(400).json({ error: 'Failed to update todo' });
}
res.json(todo);
};

exports.deleteTodo =async (req, res) => {
  try{
const todo=await Todo.findByIdAndDelete({ _id: req.params.todoId, user: req.user._id })
if ( !todo) {
return res.status(400).json({ error: 'Failed to delete todo' });
}
res.json({ message: `Todo deleted successfully  of postid :${req.params.todoId} and userid :${req.user._id}` });
}catch (err) {
  return res.status(500).json({ error: err.message });
}
};