const State = require('../models/States');
const data = require('../data/statesData.json');
const mongoose = require('mongoose');

const getAllStates = async (req, res) => {

  // DIAGNOSTIC LOGS
    console.log("Current DB Name:", mongoose.connection.name); 
    console.log("Model Collection Name:", State.collection.name);

    // 1. Handle the 'contig' query parameter (Requirement 6)
    const { contig } = req.query;
    let statesList = [...data];

    if (contig === 'true') {
        statesList = data.filter(st => st.code !== 'AK' && st.code !== 'HI');
    } else if (contig === 'false') {
        statesList = data.filter(st => st.code === 'AK' || st.code === 'HI');
    }

    try {
        const statesDB = await State.find();
        console.log("Documents found in MongoDB:", statesDB.length);

        const mergedStates = statesList.map(state => {
            const match = statesDB.find(db => db.stateCode === state.code);
            
            // Only add the funfacts array if a match is found
            return {
                ...state,
                ...(match && { funfacts: match.funfacts })
            };
        });

        res.json(mergedStates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getState = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  // Find state in JSON
  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({ message: 'Invalid state abbreviation' });
  }

  try {
    // Find fun facts in MongoDB
    const stateDB = await State.findOne({ stateCode });
    console.log("STATE FOUND:", stateDB);

    const result = {
      ...state,
      funfacts: stateDB ? stateDB.funfacts : []
    };

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  try {
    const stateDB = await State.findOne({ stateCode });

    // No fun facts found
    if (!stateDB || !stateDB.funfacts.length) {
      return res.json({ message: `No fun facts found for ${stateCode}` });
    }

    // Pick random fact
    const randomFact =
      stateDB.funfacts[Math.floor(Math.random() * stateDB.funfacts.length)];

    res.json({ funfact: randomFact });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET State Capital
const getStateCapital = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = data.find(st => st.code === stateCode);
    if (!state) return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    res.json({ "state": state.state, "capital": state.capital_city });
};

// GET State Nickname
const getStateNickname = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = data.find(st => st.code === stateCode);
    if (!state) return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    res.json({ "state": state.state, "nickname": state.nickname });
};

// POST Fun Facts
const createFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { funfacts } = req.body;

    if (!funfacts) return res.status(400).json({ "message": "State fun facts value required" });
    if (!Array.isArray(funfacts)) return res.status(400).json({ "message": "State fun facts value must be an array" });

    try {
        const result = await State.findOneAndUpdate(
            { stateCode },
            { $push: { funfacts: { $each: funfacts } } },
            { upsert: true, new: true }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
};

// PATCH Fun Fact
const updateFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index, funfact } = req.body;

    if (!index) return res.status(400).json({ "message": "State fun fact index value required" });
    if (!funfact) return res.status(400).json({ "message": "State fun fact value required" });

    try {
        const stateDB = await State.findOne({ stateCode });
        if (!stateDB || !stateDB.funfacts[index - 1]) {
            return res.status(400).json({ "message": `No fun fact found at that index for ${stateCode}` });
        }

        stateDB.funfacts[index - 1] = funfact; // Adjusting 1-based index to 0-based[cite: 1]
        const result = await stateDB.save();
        res.json(result);
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
};

// DELETE Fun Fact
const deleteFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { index } = req.body;

    if (!index) return res.status(400).json({ "message": "State fun fact index value required" });

    try {
        const stateDB = await State.findOne({ stateCode });
        if (!stateDB || !stateDB.funfacts[index - 1]) {
            return res.status(400).json({ "message": `No fun fact found at that index for ${stateCode}` });
        }

        stateDB.funfacts.splice(index - 1, 1); // Adjusting 1-based index to 0-based[cite: 1]
        const result = await stateDB.save();
        res.json(result);
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
};
// Export them correctly

module.exports = { 
    getAllStates, getState, getFunFact, 
    getStateCapital, getStateNickname, createFunFact 
};