const express = require('express');
const router = express.Router();
const mortgageController = require('../controllers/mortgageController');
const { validateMortgageInput } = require('../middleware/validation');

// Calculate monthly payment and basic info
router.post('/calculate', validateMortgageInput, mortgageController.calculatePayment);

// Generate full amortization schedule
router.post('/amortization', validateMortgageInput, mortgageController.generateAmortization);

// Calculate APR
router.post('/apr', validateMortgageInput, mortgageController.calculateAPR);

// Get loan summary with all calculations
router.post('/summary', validateMortgageInput, mortgageController.getLoanSummary);

// Compare multiple loan scenarios
router.post('/compare', mortgageController.compareLoans);

module.exports = router;