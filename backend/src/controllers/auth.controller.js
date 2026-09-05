'use strict';

const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// Cookie options — httpOnly, secure in prod, sameSite=strict always
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  // Match the 7-day refresh-token TTL
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    const e = new Error('A valid email address is required');
    e.statusCode = 422;
    throw e;
  }
}

function validatePassword(password) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    const e = new Error('Password must be at least 8 characters');
    e.statusCode = 422;
    throw e;
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

async function register(req, res, next) {
  try {
    const { email, password, role = 'employee' } = req.body;

    // 1. VALIDATE
    validateEmail(email);
    validatePassword(password);
    if (typeof role !== 'string' || !role.trim()) {
      const e = new Error('role must be a non-empty string'); e.statusCode = 422; throw e;
    }

    // callerRole is null for unauthenticated self-register;
    // set by authenticate() middleware if the caller is already logged in as admin
    const callerRole = req.user?.role || null;

    // 2. PERSIST
    const user = await authService.register(email, password, role.trim(), callerRole);

    // 3. LOG
    logger.info({ userId: user.id, role: user.role }, 'user registered');

    return sendSuccess(res, { id: user.id, email: user.email, role: user.role }, 201);
  } catch (err) {
    // Unique-email violation from Postgres
    if (err.code === '23505') {
      err.message = 'An account with this email already exists';
      err.statusCode = 409;
    }
    next(err);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. VALIDATE
    validateEmail(email);
    if (!password || typeof password !== 'string') {
      const e = new Error('Password is required'); e.statusCode = 422; throw e;
    }

    // 2. PERSIST (service handles timing-safe enumeration protection)
    const { user, accessToken, refreshTokenRaw } = await authService.login(email, password);

    // 3. SIDE EFFECTS — set httpOnly refresh-token cookie
    res.cookie('refreshToken', refreshTokenRaw, COOKIE_OPTS);

    // 4. LOG
    logger.info({ userId: user.id, role: user.role }, 'user login');

    return sendSuccess(res, { user, accessToken });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

async function refresh(req, res, next) {
  try {
    // 1. READ from httpOnly cookie (never from body — see API_GUIDE.md)
    const rawToken = req.cookies?.refreshToken;

    // 2. PERSIST — rotate tokens in transaction
    const { accessToken, refreshTokenRaw } = await authService.refresh(rawToken);

    // 3. SIDE EFFECTS — issue new cookie
    res.cookie('refreshToken', refreshTokenRaw, COOKIE_OPTS);

    // 4. LOG
    logger.info('refresh token rotated');

    return sendSuccess(res, { accessToken });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

async function logout(req, res, next) {
  try {
    const rawToken = req.cookies?.refreshToken;

    await authService.logout(rawToken);

    // Clear the cookie regardless
    res.clearCookie('refreshToken', { path: '/', httpOnly: true, sameSite: 'strict' });

    logger.info({ userId: req.user?.id }, 'user logout');

    return sendSuccess(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

async function me(req, res, next) {
  try {
    // req.user is set by authenticate() middleware — id + role
    const user = await authService.getMe(req.user.id);

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, me };
