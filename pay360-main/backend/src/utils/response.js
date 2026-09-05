'use strict';

/**
 * Frozen response helpers — every controller uses exactly these three shapes.
 * Never call res.json() directly; call one of these.
 *
 * Success:    { success: true, data }
 * Error:      { success: false, error: { message, code } }
 * Paginated:  { success: true, data: rows, pagination: { page, pageSize, total, totalPages } }
 */

/**
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [status=200]
 */
function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} status
 * @param {string|null} [code=null]  Optional machine-readable error code
 */
function sendError(res, message, status, code = null) {
  return res.status(status).json({
    success: false,
    error: { message, code },
  });
}

/**
 * @param {import('express').Response} res
 * @param {Array}  rows
 * @param {{ page: number, pageSize: number, total: number }} pagination
 */
function sendPaginated(res, rows, { page, pageSize, total }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  return res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, pageSize, total, totalPages },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
