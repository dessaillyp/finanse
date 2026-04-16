const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { success } = require('../utils/apiResponse');
const { getMonthRange, monthLabel } = require('../utils/dateHelpers');

/**
 * GET /summary
 * Returns a full monthly financial summary:
 *   - total income
 *   - total expenses
 *   - balance (auto-calculated)
 *   - savings rate
 *   - breakdown of expenses by category
 *   - top 3 expense categories
 */
const getMonthlySummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const userId = req.user?.id ?? null;
    const { start, end } = getMonthRange(year, month);

    // Run both aggregations in parallel for performance
    const [incomeAgg, expenseAgg] = await Promise.all([
      // Total income for the period
      Income.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            bySource: { $push: { source: '$source', amount: '$amount' } },
          },
        },
      ]),

      // Total expenses + breakdown by category
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total ?? 0;
    const totalExpenses = expenseAgg.reduce((sum, c) => sum + c.total, 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
      ? parseFloat(((balance / totalIncome) * 100).toFixed(2))
      : 0;

    // Enrich category breakdown with percentages
    const categoryBreakdown = expenseAgg.map((c) => ({
      category: c._id,
      total: parseFloat(c.total.toFixed(2)),
      count: c.count,
      percentage: totalExpenses > 0
        ? parseFloat(((c.total / totalExpenses) * 100).toFixed(2))
        : 0,
    }));

    // Income source breakdown
    const sourceMap = {};
    (incomeAgg[0]?.bySource ?? []).forEach(({ source, amount }) => {
      sourceMap[source] = (sourceMap[source] ?? 0) + amount;
    });
    const incomeBySource = Object.entries(sourceMap).map(([source, total]) => ({
      source,
      total: parseFloat(total.toFixed(2)),
    }));

    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;

    return success(res, {
      period: {
        year: y,
        month: m,
        label: monthLabel(y, m),
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        totalIncome:    parseFloat(totalIncome.toFixed(2)),
        totalExpenses:  parseFloat(totalExpenses.toFixed(2)),
        balance:        parseFloat(balance.toFixed(2)),
        savingsRate,
        status: balance >= 0 ? 'positive' : 'negative',
      },
      income: {
        count: incomeAgg[0]?.count ?? 0,
        bySource: incomeBySource,
      },
      expenses: {
        count: expenseAgg.reduce((s, c) => s + c.count, 0),
        byCategory: categoryBreakdown,
        topCategory: categoryBreakdown[0]?.category ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMonthlySummary };
