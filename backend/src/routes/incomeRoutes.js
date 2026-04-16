const express = require('express');
const { body, query, param } = require('express-validator');
const { createIncome, getIncome, deleteIncome } = require('../controllers/incomeController');
const validate = require('../middleware/validate');
// const { protect } = require('../middleware/auth'); // uncomment when auth is live

const router = express.Router();

// Validation rules
const createIncomeRules = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 200 }).withMessage('Description max 200 chars'),
  body('source')
    .optional()
    .isIn(['salary', 'freelance', 'investment', 'rental', 'gift', 'other'])
    .withMessage('Invalid income source'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes max 500 chars'),
];

const listIncomeRules = [
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be 1–12'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
];

// Routes
// Add `protect` as second arg (before validate) once auth is ready:
//   router.post('/', protect, createIncomeRules, validate, createIncome)
router.post('/',    createIncomeRules, validate, createIncome);
router.get('/',     listIncomeRules,   validate, getIncome);
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid ID'),
  validate,
  deleteIncome
);

module.exports = router;
