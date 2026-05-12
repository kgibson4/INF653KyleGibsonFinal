// Import MongoDB model for state fun facts
const State = require('../models/States');

// Import static JSON dataset containing base state information
const data = require('../data/statesData.json');

/* =========================
   GET ALL STATES
   Combines JSON data + MongoDB fun facts
========================= */
const getAllStates = async (req, res) => {
  try {
    const statesDB = await State.find(); // fetch all stored fun facts

    let filteredData = data;

    // Filter contiguous states (exclude AK, HI)
    if (req.query.contig === 'true') {
      filteredData = data.filter(
        state => state.code !== 'AK' && state.code !== 'HI'
      );
    }

    // Filter non-contiguous states (only AK, HI)
    if (req.query.contig === 'false') {
      filteredData = data.filter(
        state => state.code === 'AK' || state.code === 'HI'
      );
    }

    // Merge JSON data with MongoDB fun facts
    const mergedStates = filteredData.map(state => {
      const match = statesDB.find(db => db.stateCode === state.code);

      // Only attach funfacts if they exist in DB
      if (match && match.funfacts && match.funfacts.length > 0) {
        return { ...state, funfacts: match.funfacts };
      }

      return state;
    });

    res.json(mergedStates);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE STATE DATA
========================= */
const getState = async (req, res) => {

  const stateCode = req.params.state.toUpperCase();

  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  try {
    const stateDB = await State.findOne({ stateCode });

    const result = { ...state };

    // Attach funfacts ONLY if record exists in DB
    if (stateDB) {
      result.funfacts = stateDB.funfacts || [];
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

/* =========================
   GET RANDOM FUN FACT
========================= */
const getFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  try {
    const stateDB = await State.findOne({ stateCode });

    // Ensure funfacts exist before selecting random
    if (!stateDB || !stateDB.funfacts || !stateDB.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Facts found for ${state.state}`
      });
    }

    // Pick random fun fact
    const randomFact =
      stateDB.funfacts[Math.floor(Math.random() * stateDB.funfacts.length)];

    res.json({ funfact: randomFact });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   SIMPLE STATE DATA ENDPOINTS
   (No MongoDB required)
========================= */

// Capital city
const getCapital = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  res.json({ state: state.state, capital: state.capital_city });
};

// Nickname
const getNickname = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  res.json({ state: state.state, nickname: state.nickname });
};

// Population (formatted with commas)
const getPopulation = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  res.json({
    state: state.state,
    population: state.population.toLocaleString('en-US')
  });
};

// Admission date
const getAdmission = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  res.json({ state: state.state, admitted: state.admission_date });
};

/* =========================
   ADD FUN FACTS (POST)
========================= */
const addFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const { funfacts } = req.body;

  const stateExists = data.find(state => state.code === stateCode);

  if (!stateExists) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  if (!funfacts) {
    return res.status(400).json({
      message: 'State fun facts value required'
    });
  }

  if (!Array.isArray(funfacts)) {
    return res.status(400).json({
      message: 'State fun facts value must be an array'
    });
  }

  try {
    let state = await State.findOne({ stateCode });

    // Create or update document
    if (!state) {
      state = await State.create({ stateCode, funfacts });
    } else {
      state.funfacts.push(...funfacts);
      await state.save();
    }

    const updatedState = await State.findOne({ stateCode });

    res.json(updatedState);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE FUN FACT (PATCH)
========================= */
const updateFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const { index, funfact } = req.body;

  const stateExists = data.find(state => state.code === stateCode);

  if (!stateExists) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  if (!index) {
    return res.status(400).json({
      message: 'State fun fact index value required'
    });
  }

  if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({
      message: 'State fun fact value required'
    });
  }

  try {
    const state = await State.findOne({ stateCode });

    if (!state || !state.funfacts || !state.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Facts found for ${stateExists.state}`
      });
    }

    const factIndex = index - 1;

    if (factIndex < 0 || factIndex >= state.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Fact found at that index for ${stateExists.state}`
      });
    }

    state.funfacts[factIndex] = funfact;
    await state.save();

    const updatedState = await State.findOne({ stateCode });

    res.json(updatedState);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE FUN FACT
========================= */
const deleteFunFact = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const { index } = req.body;

  const stateExists = data.find(state => state.code === stateCode);

  if (!stateExists) {
    return res.status(404).json({
      message: 'Invalid state abbreviation parameter'
    });
  }

  if (!index) {
    return res.status(400).json({
      message: 'State fun fact index value required'
    });
  }

  try {
    const state = await State.findOne({ stateCode });

    if (!state || !state.funfacts || !state.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Facts found for ${stateExists.state}`
      });
    }

    const factIndex = index - 1;

    if (factIndex < 0 || factIndex >= state.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Fact found at that index for ${stateExists.state}`
      });
    }

    state.funfacts.splice(factIndex, 1);
    await state.save();

    const updatedState = await State.findOne({ stateCode });

    res.json(updatedState);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export all controller functions for routes
module.exports = {
  getAllStates,
  getState,
  getFunFact,
  addFunFact,
  updateFunFact,
  deleteFunFact,
  getCapital,
  getNickname,
  getPopulation,
  getAdmission
};