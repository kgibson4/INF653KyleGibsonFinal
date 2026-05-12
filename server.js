// Import required packages
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Use the states routes for all /states endpoints
app.use('/states', require('./routes/states'));

// Connect to MongoDB using the connection string in .env
mongoose.connect(process.env.DATABASE_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route serving the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for undefined endpoints
app.all('/{*any}', (req, res) => {

  // Set response status to 404 Not Found
  res.status(404);

  // Return HTML if the client accepts HTML
  if (req.accepts('html')) {
    res.type('html');
    res.send('<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>');

  // Return JSON if the client accepts JSON
  } else if (req.accepts('json')) {
    res.json({ "error": '404 Not Found' });

  // Otherwise return plain text
  } else {
    res.type('txt').send('404 Not Found');
  }

});

// Use environment port if available, otherwise default to 3500
const PORT = process.env.PORT || 3500;

// Start the Express server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));