const { getMonthRange } = require('../src/utils/queryHelpers');
const { buildDateFilter, buildPaginationMeta } = require('../src/utils/queryHelpers');

describe('getMonthRange', () => {
  test('returns correct start and end for January 2024', () => {
    const { start, end } = getMonthRange(2024, 1);
    expect(start).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));
    expect(end.getDate()).toBe(31);
    expect(end.getMonth()).toBe(0);
  });

  test('returns correct end day for February 2024 (leap year)', () => {
    const { end } = getMonthRange(2024, 2);
    expect(end.getDate()).toBe(29);
  });

  test('returns correct end day for February 2023 (non-leap year)', () => {
    const { end } = getMonthRange(2023, 2);
    expect(end.getDate()).toBe(28);
  });
});

describe('buildPaginationMeta', () => {
  test('calculates totalPages correctly', () => {
    const meta = buildPaginationMeta({ total: 50, page: 1, limit: 20 });
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(false);
  });

  test('last page has no next page', () => {
    const meta = buildPaginationMeta({ total: 50, page: 3, limit: 20 });
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
  });
});

describe('buildDateFilter', () => {
  test('returns empty object when no dates provided', () => {
    expect(buildDateFilter(undefined, undefined)).toEqual({});
  });

  test('builds $gte filter from startDate only', () => {
    const filter = buildDateFilter('2024-01-01', undefined);
    expect(filter.date.$gte).toBeInstanceOf(Date);
    expect(filter.date.$lte).toBeUndefined();
  });

  test('builds both $gte and $lte when both dates provided', () => {
    const filter = buildDateFilter('2024-01-01', '2024-01-31');
    expect(filter.date.$gte).toBeInstanceOf(Date);
    expect(filter.date.$lte).toBeInstanceOf(Date);
  });
});
