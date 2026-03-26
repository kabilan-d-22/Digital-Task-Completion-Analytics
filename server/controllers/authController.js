const User = require('../models/User');
const Group = require('../models/Group');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate PIN
const generateGroupPin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, groupPin } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });

    if (role === 'Head') {
      const pin = generateGroupPin();
      // Save user first to get ID
      await user.save();

      const group = new Group({
        group_name: `${name}'s Team`,
        group_pin: pin,
        head_id: user._id
      });
      await group.save();

      // Update user with the new group ID
      user.group_id = group._id;
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, groupId: group._id },
        groupPin: pin
      });
    } else {
      if (!groupPin) return res.status(400).json({ error: 'Group PIN is required' });

      const group = await Group.findOne({ group_pin: groupPin });
      if (!group) return res.status(400).json({ error: 'Invalid group PIN' });

      user.group_id = group._id;
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, groupId: user.group_id }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, groupId: user.group_id }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { register, login };