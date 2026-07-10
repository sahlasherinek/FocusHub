"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodos = void 0;
const Todo_1 = __importDefault(require("../models/Todo"));
const getTodos = async (req, res) => {
    try {
        const todos = await Todo_1.default.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(todos);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch todos' });
    }
};
exports.getTodos = getTodos;
const createTodo = async (req, res) => {
    try {
        const { title, priority } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const todo = await Todo_1.default.create({
            title: title.trim(),
            priority: priority || 'Medium',
            user: req.user.id,
        });
        res.status(201).json(todo);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to create todo' });
    }
};
exports.createTodo = createTodo;
const updateTodo = async (req, res) => {
    try {
        const todo = await Todo_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, // ownership check baked into the query
        req.body, { new: true, runValidators: true });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json(todo);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update todo' });
    }
};
exports.updateTodo = updateTodo;
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted', id: req.params.id });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to delete todo' });
    }
};
exports.deleteTodo = deleteTodo;
