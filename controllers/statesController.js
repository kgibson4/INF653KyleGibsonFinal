const State = require('../models/States');
const data = require('../data/statesData.json');

const getAllStates = async (req, res) => {
  try {
    const statesDB = await State.find();

    const mergedStates = data.map(state => {
      const match = statesDB.find(
        db => db.stateCode === state.code
      );

      return {
        ...state,
        funfacts: match ? match.funfacts : []
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

// Export them correctly
module.exports = { getAllStates };
module.exports = { getAllStates, getState };
module.exports = { getAllStates, getState, getFunFact };