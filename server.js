const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// Middleware (lets you read JSON from requests)
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));