const { error } = require('../utils/apiResponse');

/**
 * Global error handler — catches anything thrown or passed to next(err).
 * Must be registered LAST in Express middleware chain.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return error(res, 'Validation error', 400, messages);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return error(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return error(res, `Duplicate value for field: ${field}`, 409);
  }

  // JWT errors (scaffolded for auth)
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401);
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';
  return error(res, message, statusCode);
};

module.exports = errorHandler;
