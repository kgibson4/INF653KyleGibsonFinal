const State = require('../models/States');
const data = require('../data/statesData.json');
const mongoose = require('mongoose');

const getAllStates = async (req, res) => {
    const { contig } = req.query;
    let statesList = [...data];

    if (contig === 'true') {
        statesList = data.filter(st => st.code !== 'AK' && st.code !== 'HI');
    } else if (contig === 'false') {
        statesList = data.filter(st => st.code === 'AK' || st.code === 'HI');
    }

    try {
        const statesDB = await State.find();

        const mergedStates = statesList.map(state => {
            const match = statesDB.find(db => db.stateCode === state.code);
            
            // Only add the funfacts property if facts exist in DB
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

const getState = async (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(s => s.code === stateCode);

    if (!state) {
        // Must be a 400 status and exact error message
        return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    }

    try {
        const stateDB = await State.findOne({ stateCode });
        const result = {
            ...state,
            // For single state, always include funfacts property
            funfacts: stateDB ? stateDB.funfacts : []
        };
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getFunFact = async (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(s => s.code === stateCode);

    if (!state) {
        return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    }

    try {
        const stateDB = await State.findOne({ stateCode });

        if (!stateDB || !stateDB.funfacts || stateDB.funfacts.length === 0) {
            // Must be a 404 status and include the full state name
            return res.status(404).json({ "message": `No Fun Facts found for ${state.state}` });
        }

        const randomFact = stateDB.funfacts[Math.floor(Math.random() * stateDB.funfacts.length)];
        res.json({ funfact: randomFact });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStateCapital = (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(st => st.code === stateCode);
    if (!state) return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    res.json({ "state": state.state, "capital": state.capital_city });
};

const getStateNickname = (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(st => st.code === stateCode);
    if (!state) return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    res.json({ "state": state.state, "nickname": state.nickname });
};

// ADDED: Population route with comma formatting
const getStatePopulation = (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(st => st.code === stateCode);
    if (!state) return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    res.json({ 
        "state": state.state, 
        "population": state.population.toLocaleString() 
    });
};

// ADDED: Admission route
const getStateAdmission = (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(st => st.code === stateCode);
    if (!state) return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
    res.json({ "state": state.state, "admitted": state.admission_date });
};

const createFunFact = async (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
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

const updateFunFact = async (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(s => s.code === stateCode);
    const { index, funfact } = req.body;

    if (!index) return res.status(400).json({ "message": "State fun fact index value required" });
    if (!funfact) return res.status(400).json({ "message": "State fun fact value required" });

    try {
        const stateDB = await State.findOne({ stateCode });
        // Handle "No Fun Facts found for [StateName]"
        if (!stateDB || !stateDB.funfacts || stateDB.funfacts.length === 0) {
            return res.status(400).json({ "message": `No Fun Facts found for ${state.state}` });
        }
        // Handle "No Fun Fact found at that index for [StateName]"
        if (!stateDB.funfacts[index - 1]) {
            return res.status(400).json({ "message": `No Fun Fact found at that index for ${state.state}` });
        }

        stateDB.funfacts[index - 1] = funfact;
        const result = await stateDB.save();
        res.json(result);
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
};

const deleteFunFact = async (req, res) => {
    const stateCode = req.params.state?.toUpperCase();
    const state = data.find(s => s.code === stateCode);
    const { index } = req.body;

    if (!index) return res.status(400).json({ "message": "State fun fact index value required" });

    try {
        const stateDB = await State.findOne({ stateCode });
        if (!stateDB || !stateDB.funfacts || stateDB.funfacts.length === 0) {
            return res.status(400).json({ "message": `No Fun Facts found for ${state.state}` });
        }
        if (!stateDB.funfacts[index - 1]) {
            return res.status(400).json({ "message": `No Fun Fact found at that index for ${state.state}` });
        }

        stateDB.funfacts.splice(index - 1, 1);
        const result = await stateDB.save();
        res.json(result);
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
};

// Export ALL functions
module.exports = { 
    getAllStates, getState, getFunFact, 
    getStateCapital, getStateNickname, getStatePopulation, 
    getStateAdmission, createFunFact, updateFunFact, deleteFunFact 
};