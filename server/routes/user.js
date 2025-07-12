
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userAuth = require('../middleware/userAuth');
const upload = require('../middleware/upload');
const jwt = require('jsonwebtoken');

const router = express.Router();

// 👤 Get logged-in user's profile
router.get('/me', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✏️ Update logged-in user's profile
router.put('/me', userAuth, upload.single('photo'), async (req, res) => {
  try {
    const { firstName, lastName, department } = req.body;

    const updateData = {
      firstName,
      lastName,
      department
    };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔑 Change password
router.put('/me/password', userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare submitted password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT payload and sign token
    const payload = { userId: user._id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send token and user info (excluding password)
    
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        status: user.status,
        photo: user.photo || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
