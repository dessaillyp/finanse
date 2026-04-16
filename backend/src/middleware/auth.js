const jwt = require('jsonwebtoken');
const { error } = require('../utils/apiResponse');

/**
 * JWT auth middleware — scaffolded and ready.
 * Attach to any route that requires authentication:
 *   router.get('/protected', protect, controller)
 *
 * When a valid token is provided, it populates req.user
 * with { id, email } so controllers can scope queries.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided. Authorization required.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    next(err); // caught by global error handler
  }
};

module.exports = { protect };
