'use strict';

const { getDashboardData } = require('../services/dashboard.service');
const { askAboutPayrollData, isConfigured } = require('../services/ai.service');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

const MAX_QUESTION_LENGTH = 500;

// ─── GET /api/ai/status ─────────────────────────────────────────────────────────────────────────
// Lets the frontend show "AI Assistant unavailable" gracefully instead of a raw error when no
// key is configured (CLAUDE.md pattern 8 — degrade, never a raw 500 in front of anyone).

async function status(req, res, next) {
  try {
    return sendSuccess(res, { configured: isConfigured() });
  } catch (err) { next(err); }
}

// ─── POST /api/ai/ask ───────────────────────────────────────────────────────────────────────────

async function ask(req, res, next) {
  try {
    const { question, period_start, period_end, department_id, employee_type } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      const e = new Error('question is required'); e.statusCode = 422; throw e;
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      const e = new Error(`question must be ${MAX_QUESTION_LENGTH} characters or fewer`); e.statusCode = 422; throw e;
    }

    const contextData = await getDashboardData({ period_start, period_end, department_id, employee_type });
    const answer = await askAboutPayrollData({ question: question.trim(), contextData });

    logger.info({ userId: req.user.id, questionLength: question.length }, 'AI assistant question answered');
    return sendSuccess(res, {
      answer,
      data_used: { period_start: period_start || null, period_end: period_end || null, department_id: department_id || null, employee_type: employee_type || null },
    });
  } catch (err) { next(err); }
}

module.exports = { status, ask };
