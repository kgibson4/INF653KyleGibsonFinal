// Import Mongoose library for MongoDB modeling
const mongoose = require('mongoose');

// Shortcut to Mongoose Schema constructor
const Schema = mongoose.Schema;

// Define schema for State documents in MongoDB
const stateSchema = new Schema({

  // State abbreviation (e.g., KS, MO)
  stateCode: {
    type: String,     // stored as a string
    required: true,   // must be provided
    unique: true      // ensures no duplicate state codes
  },

  // Array of fun facts about the state
  funfacts: {
    type: [String],   // array of strings
    default: []       // defaults to empty array if none provided
  }

});

// Export the model so it can be used in controllers
module.exports = mongoose.model('State', stateSchema);