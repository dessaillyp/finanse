const express = require('express');
const { query } = require('express-validator');
const { getMonthlySummary } = require('../controllers/summaryController');
const validate = require('../middleware/validate');

const router = express.Router();

const summaryRules = [
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be 1–12'),
];

router.get('/', summaryRules, validate, getMonthlySummary);

module.exports = router;
