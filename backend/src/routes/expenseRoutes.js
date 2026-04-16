const express = require('express');
const { body, query, param } = require('express-validator');
const {
  createExpense,
  getExpenses,
  getCategories,
  deleteExpense,
} = require('../controllers/expenseController');
const validate = require('../middleware/validate');
const Expense = require('../models/Expense');

const router = express.Router();

const createExpenseRules = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 200 }).withMessage('Description max 200 chars'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(Expense.CATEGORIES)
    .withMessage(`Category must be one of: ${Expense.CATEGORIES.join(', ')}`),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes max 500 chars'),
  body('isRecurring')
    .optional()
    .isBoolean().withMessage('isRecurring must be a boolean'),
];

const listExpenseRules = [
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be 1–12'),
  query('category').optional().isIn(Expense.CATEGORIES).withMessage('Invalid category'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
];

router.get('/categories', getCategories);
router.post('/',    createExpenseRules, validate, createExpense);
router.get('/',     listExpenseRules,   validate, getExpenses);
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid ID'),
  validate,
  deleteExpense
);

module.exports = router;
