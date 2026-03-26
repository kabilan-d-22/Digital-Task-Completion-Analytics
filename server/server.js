// project/server/index.js (or server.js)
const express = require('express');
const mongoose = require('mongoose'); // Add this line
const cors = require('cors');
const dotenv = require('dotenv');

require('dotenv').config();

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ADD THIS DATABASE CONNECTION BLOCK ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
// -------------------------------------------

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const taskRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});