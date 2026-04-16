const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/apiResponse');

/**
 * Middleware that reads express-validator results and returns
 * a formatted 400 if any rule failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return badRequest(res, 'Validation failed', formatted);
  }
  next();
};

module.exports = validate;
