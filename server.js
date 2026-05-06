const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use('/states', require('./routes/states'));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));