'use strict';

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

/**
 * authenticate — verifies the JWT from the Authorization header.
 * Pins algorithm to HS256 — never trusts alg from the token header.
 * Sets req.user = { id, role, employee_id? } on success.
 */
async function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401, 'MISSING_TOKEN');
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'], // pinned — never allow 'none' or RS256 switching
    });
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    // jwt.TokenExpiredError, jwt.JsonWebTokenError, etc. — all map to 401
    return sendError(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}

/**
 * authorize(...roles) — role-based access control middleware factory.
 * Usage: router.get('/', authorize('hr_manager', 'admin'), ctrl.list)
 * Ownership checks (employee self-service) are done inside the controller,
 * NOT here — see API_GUIDE.md's note on that gap.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'MISSING_TOKEN');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403, 'FORBIDDEN');
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
