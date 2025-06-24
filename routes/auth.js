const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UserModel } = require('../models');
const { validateUser, validateLogin } = require('../middleware/validation');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register
router.post('/register', validateUser, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user;
    if (process.env.DATABASE_TYPE === 'mongodb') {
      user = new User({ username, email, password });
      await user.save();
      user = user.toObject();
      delete user.password;
    } else {
      user = await UserModel.create({ username, email, password });
    }

    const token = generateToken(user.id || user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    if (error.code === 11000 || error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let isValidPassword;

    if (process.env.DATABASE_TYPE === 'mongodb') {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      isValidPassword = await user.comparePassword(password);
    } else {
      user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      isValidPassword = await UserModel.comparePassword(password, user.password);
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id || user._id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});


module.exports = router;