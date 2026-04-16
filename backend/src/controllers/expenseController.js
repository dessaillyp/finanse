const Expense = require('../models/Expense');
const { success, created, notFound } = require('../utils/apiResponse');
const { getMonthRange } = require('../utils/dateHelpers');

/**
 * POST /expense
 */
const createExpense = async (req, res, next) => {
  try {
    const { amount, description, category, date, notes, isRecurring } = req.body;

    const expense = await Expense.create({
      userId: req.user?.id ?? null,
      amount,
      description,
      category,
      date: date ? new Date(date) : new Date(),
      notes,
      isRecurring: isRecurring ?? false,
    });

    return created(res, { expense }, 'Expense recorded successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /expenses
 * Supports filters: year, month, category, isRecurring, page, limit
 */
const getExpenses = async (req, res, next) => {
  try {
    const { year, month, category, isRecurring, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user?.id ?? null };

    if (year || month) {
      const { start, end } = getMonthRange(year, month);
      filter.date = { $gte: start, $lte: end };
    }

    if (category) filter.category = category;
    if (isRecurring !== undefined) filter.isRecurring = isRecurring === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);

    return success(res, {
      records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /expenses/categories
 * Returns the list of valid categories (useful for frontend dropdowns).
 */
const getCategories = async (req, res, next) => {
  try {
    return success(res, { categories: Expense.CATEGORIES });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /expenses/:id
 */
const deleteExpense = async (req, res, next) => {
  try {
    const record = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id ?? null,
    });

    if (!record) return notFound(res, 'Expense record not found');

    return success(res, {}, 'Expense record deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { createExpense, getExpenses, getCategories, deleteExpense };
