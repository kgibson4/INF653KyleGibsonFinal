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

// Export it correctly
module.exports = { getAllStates };