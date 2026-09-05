'use strict';

const { getDashboardData } = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

// ─── GET /api/dashboard?period_start=&period_end=&department_id=&employee_type= ───────────────
// Every number below is computed live from real rows — nothing hardcoded, nothing cached
// (CLAUDE.md's Dynamic Data Mandate). All filters are optional. The actual aggregation queries
// live in dashboard.service.js so the AI Assistant (ai.controller.js) can reuse the exact same
// data-fetching path instead of a second, potentially-drifting one.

async function getDashboard(req, res, next) {
  try {
    const data = await getDashboardData(req.query);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
}

module.exports = { getDashboard };
