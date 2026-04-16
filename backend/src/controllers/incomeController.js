const Income = require('../models/Income');
const { success, created, notFound } = require('../utils/apiResponse');
const { getMonthRange } = require('../utils/dateHelpers');

/**
 * POST /income
 * Create a new income record.
 */
const createIncome = async (req, res, next) => {
  try {
    const { amount, description, source, date, notes } = req.body;

    const income = await Income.create({
      userId: req.user?.id ?? null, // null until auth is enabled
      amount,
      description,
      source,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    return created(res, { income }, 'Income recorded successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /income
 * List income records with optional month/year filters and pagination.
 */
const getIncome = async (req, res, next) => {
  try {
    const { year, month, source, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user?.id ?? null };

    if (year || month) {
      const { start, end } = getMonthRange(year, month);
      filter.date = { $gte: start, $lte: end };
    }

    if (source) filter.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Income.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Income.countDocuments(filter),
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
 * DELETE /income/:id
 * Soft-delete pattern could be added; hard delete for now.
 */
const deleteIncome = async (req, res, next) => {
  try {
    const record = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id ?? null,
    });

    if (!record) return notFound(res, 'Income record not found');

    return success(res, {}, 'Income record deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { createIncome, getIncome, deleteIncome };
