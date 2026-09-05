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
 * optionalAuthenticate — like authenticate, but never rejects.
 * Sets req.user if a valid HS256 Bearer token is present; otherwise req.user
 * stays undefined and the request continues. Used on /register so that:
 *   • unauthenticated self-register still works (no token → req.user = undefined → callerRole = null → locked to 'employee')
 *   • an authenticated admin can pass their token and create privileged-role accounts
 * Never call next(err) here — a missing/invalid token is simply treated as anonymous.
 */
async function optionalAuthenticate(req, _res, next) {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
      });
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // Invalid/expired token on an optional route — ignore, proceed as anonymous
    }
  }
  return next();
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

module.exports = { authenticate, authorize, optionalAuthenticate };
