const State = require('../models/States');
const data = require('../data/statesData.json');

const getAllStates = async (req, res) => {
  try {
    const statesDB = await State.find();

    let filteredData = data;

    // Handle contig query
    if (req.query.contig === 'true') {
      filteredData = data.filter(
        state => state.code !== 'AK' && state.code !== 'HI'
      );
    }

    if (req.query.contig === 'false') {
      filteredData = data.filter(
        state => state.code === 'AK' || state.code === 'HI'
      );
    }

    const mergedStates = filteredData.map(state => {
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

  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  try {
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

    if (!stateDB || !stateDB.funfacts.length) {
      return res.json({
        message: `No fun facts found for ${stateCode}`
      });
    }

    const randomFact =
      stateDB.funfacts[
        Math.floor(Math.random() * stateDB.funfacts.length)
      ];

    res.json({ funfact: randomFact });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCapital = (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  res.json({
    state: state.state,
    capital: state.capital_city
  });
};

const getNickname = (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  res.json({
    state: state.state,
    nickname: state.nickname
  });
};

const getPopulation = (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  res.json({
    state: state.state,
    population: state.population.toLocaleString()
  });
};

const getAdmission = (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  const state = data.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  res.json({
    state: state.state,
    admitted: state.admission_date
  });
};

const addFunFact = async (req, res) => {

  const stateCode = req.params.state.toUpperCase();
  const { funfacts } = req.body;

  // Validate state
  const stateExists = data.find(
    state => state.code === stateCode
  );

  if (!stateExists) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  // Validate body
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

    // Create new document if none exists
    if (!state) {

      state = await State.create({
        stateCode,
        funfacts
      });

    } else {

      state.funfacts.push(...funfacts);
      await state.save();

    }

    res.json(state);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

const updateFunFact = async (req, res) => {

  const stateCode = req.params.state.toUpperCase();
  const { index, funfact } = req.body;

  // Validate state
  const stateExists = data.find(
    state => state.code === stateCode
  );

  if (!stateExists) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  // Validate body
  if (!index) {
    return res.status(400).json({
      message: 'State fun fact index value required'
    });
  }

  if (!funfact) {
    return res.status(400).json({
      message: 'State fun fact value required'
    });
  }

  try {

    const state = await State.findOne({ stateCode });

    if (!state || !state.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Facts found for ${stateCode}`
      });
    }

    // Convert to zero-based index
    const factIndex = index - 1;

    if (!state.funfacts[factIndex]) {
      return res.status(404).json({
        message: `No Fun Fact found at that index for ${stateCode}`
      });
    }

    state.funfacts[factIndex] = funfact;

    await state.save();

    res.json(state);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

const deleteFunFact = async (req, res) => {

  const stateCode = req.params.state.toUpperCase();
  const { index } = req.body;

  // Validate state
  const stateExists = data.find(
    state => state.code === stateCode
  );

  if (!stateExists) {
    return res.status(404).json({
      message: 'Invalid state abbreviation'
    });
  }

  // Validate body
  if (!index) {
    return res.status(400).json({
      message: 'State fun fact index value required'
    });
  }

  try {

    const state = await State.findOne({ stateCode });

    if (!state || !state.funfacts.length) {
      return res.status(404).json({
        message: `No Fun Facts found for ${stateCode}`
      });
    }

    // Convert to zero-based index
    const factIndex = index - 1;

    if (!state.funfacts[factIndex]) {
      return res.status(404).json({
        message: `No Fun Fact found at that index for ${stateCode}`
      });
    }

    // Remove fun fact
    state.funfacts.splice(factIndex, 1);

    await state.save();

    res.json(state);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

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