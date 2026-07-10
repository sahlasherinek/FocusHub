import { Response } from 'express';
import Todo from '../models/Todo';
import { AuthRequest } from '../middleware/auth';

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const todos = await Todo.find({ user: req.user!.id }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
};

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, priority } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const todo = await Todo.create({
      title: title.trim(),
      priority: priority || 'Medium',
      user: req.user!.id,
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id }, // ownership check baked into the query
      req.body,
      { new: true, runValidators: true }
    );
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.status(200).json({ message: 'Todo deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete todo' });
  }
};