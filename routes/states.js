// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions that handle the logic for each route
const statesController = require('../controllers/statesController');

// GET all states (with optional query filters like contig=true/false)
router.get('/', statesController.getAllStates);

// Fun facts routes (GET, POST, PATCH, DELETE)
router.get('/:state/funfact', statesController.getFunFact);     // Get a random fun fact
router.post('/:state/funfact', statesController.addFunFact);    // Add new fun facts
router.patch('/:state/funfact', statesController.updateFunFact); // Update a fun fact by index
router.delete('/:state/funfact', statesController.deleteFunFact); // Delete a fun fact by index

// State information routes
router.get('/:state/capital', statesController.getCapital);       // Get capital city
router.get('/:state/nickname', statesController.getNickname);     // Get state nickname
router.get('/:state/population', statesController.getPopulation); // Get population
router.get('/:state/admission', statesController.getAdmission);   // Get admission date

// GET full state data (must come after specific routes to avoid conflicts)
router.get('/:state', statesController.getState);

// Export router so it can be used in server.js
module.exports = router;