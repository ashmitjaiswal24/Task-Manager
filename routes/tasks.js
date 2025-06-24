// routes/tasks.js
const express = require('express');
const Task = require('../models/task');
const { TaskModel } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all task routes
router.use(authenticateToken);

// Get all tasks for authenticated user
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    let tasks;
    if (process.env.DATABASE_TYPE === 'mongodb') {
      const query = { userId: req.user._id, ...filters };
      tasks = await Task.find(query).sort({ createdAt: -1 });
    } else {
      tasks = await TaskModel.findByUserId(req.user.id, filters);
    }

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    let task;
    if (process.env.DATABASE_TYPE === 'mongodb') {
      task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    } else {
      task = await TaskModel.findById(req.params.id, req.user.id);
    }

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/', validateTask, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user._id || req.user.id
    };

    let task;
    if (process.env.DATABASE_TYPE === 'mongodb') {
      task = new Task(taskData);
      await task.save();
    } else {
      task = await TaskModel.create(taskData);
    }

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', validateTask, async (req, res) => {
  try {
    let task;
    if (process.env.DATABASE_TYPE === 'mongodb') {
      task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      task = await TaskModel.update(req.params.id, req.user.id, req.body);
    }

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    let task;
    if (process.env.DATABASE_TYPE === 'mongodb') {
      task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    } else {
      task = await TaskModel.delete(req.params.id, req.user.id);
    }

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;