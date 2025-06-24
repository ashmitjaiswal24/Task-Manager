const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const cors = require('cors');
const { validateUser } = require('../middleware/validation');
const redisClient = require('../utils/redisClient');


const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password, ...userObj } = req.user.toObject();
    userObj.name = userObj.name || userObj.username || '';
    res.json({ user: userObj });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/register', validateUser, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user/email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // Debug log

    // Try to send the OTP email first
    try {
      console.log('Sending OTP email to:', email);
      await sendEmail(
        email,
        'Your OTP Code',
        `Your OTP code is: ${otp}`
      );
      console.log('OTP email sent successfully');
    } catch (err) {
      console.error('Failed to send OTP email:', err);
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again later.' });
    }

    // Store pending user in Redis for 10 minutes
    const userData = { username, email, password, otp };
    console.log('Storing in Redis:', { email, otp }); // Debug log
    
    try {
      await redisClient.setEx(
        `otp:${email}`,
        600, // 10 minutes in seconds
        JSON.stringify(userData)
      );
      console.log('Successfully stored in Redis'); // Debug log
    } catch (redisError) {
      console.error('Redis storage error:', redisError);
      return res.status(500).json({ error: 'Failed to store registration data. Please try again.' });
    }

    res.status(201).json({ message: 'Registration successful! Please check your email for the OTP.' });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/verify-otp', async (req, res) => {
  console.log('Received /verify-otp request:', req.body);
  try {
    const { email, otp } = req.body;
    console.log('Verifying OTP for:', email);
    console.log('Received OTP:', otp, 'Type:', typeof otp);

    // Get pending user from Redis
    const data = await redisClient.get(`otp:${email}`);
    console.log('Raw Redis data:', data);

    if (!data) {
      console.log('No data found in Redis for email:', email);
      return res.status(400).json({ message: 'No pending registration for this email or OTP expired.' });
    }

    const pending = JSON.parse(data);
    console.log('Parsed Redis data:', pending);
    console.log('Stored OTP:', pending.otp, 'Type:', typeof pending.otp);

    // Convert both OTPs to strings for comparison
    const receivedOtp = String(otp).trim();
    const storedOtp = String(pending.otp).trim();
    
    console.log('Comparing OTPs:');
    console.log('Received (trimmed):', receivedOtp);
    console.log('Stored (trimmed):', storedOtp);
    console.log('Are they equal?', receivedOtp === storedOtp);

    if (receivedOtp !== storedOtp) {
      console.log('OTP mismatch');
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Save user to DB
    const user = new User({
      username: pending.username,
      email: pending.email,
      password: pending.password,
      verified: true,
    });
    await user.save();
    console.log('User saved to database');

    // Remove OTP from Redis
    await redisClient.del(`otp:${email}`);
    console.log('OTP removed from Redis');

    res.json({ message: 'Email verified and registration complete!' });
  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Update user profile (name and profile picture)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name) user.name = name;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();
    const { password, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;