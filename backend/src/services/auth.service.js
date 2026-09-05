'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = 12;
const ALLOWED_SELF_ROLES = ['employee'];
const ALL_ROLES = ['employee', 'hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signAccessToken(userId, role) {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn: process.env.JWT_ACCESS_TTL || '15m' }
  );
}

function signRefreshToken(userId) {
  // Opaque 64-byte random token — stored as a hash in DB, delivered via httpOnly cookie
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

function refreshTokenExpiresAt() {
  // Default 7 days
  const ttl = process.env.JWT_REFRESH_TTL || '7d';
  const days = parseInt(ttl, 10) || 7;
  const ms = ttl.endsWith('d') ? days * 86400 * 1000
    : ttl.endsWith('h') ? days * 3600 * 1000
    : 7 * 86400 * 1000;
  return new Date(Date.now() + ms);
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password  plaintext
 * @param {string} role      must be in ALLOWED_SELF_ROLES for self-register, or caller must be admin
 * @param {string|null} callerRole  null = unauthenticated self-register
 */
async function register(email, password, role, callerRole) {
  // Enforce: self-register only creates 'employee' role
  if (!ALLOWED_SELF_ROLES.includes(role) && callerRole !== 'admin') {
    const e = new Error('Only an admin may create privileged-role users');
    e.statusCode = 403;
    throw e;
  }

  if (!ALL_ROLES.includes(role)) {
    const e = new Error(`Invalid role. Must be one of: ${ALL_ROLES.join(', ')}`);
    e.statusCode = 422;
    throw e;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, employee_id, created_at`,
    [email.toLowerCase().trim(), passwordHash, role]
  );

  return rows[0];
}

/**
 * Login — returns { user, accessToken, refreshTokenRaw }.
 * Returns IDENTICAL error shape for wrong password and nonexistent email (no enumeration).
 */
async function login(email, password) {
  // Intentionally non-leaking: same error, same timing-safe path for both cases
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, role, employee_id, is_active
     FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );

  // Always run bcrypt compare to prevent timing-based enumeration
  const fakeHash = '$2b$12$invalidhashfortimingequalityXXXXXXXXXXXXXXXXXXXXXXXXX';
  const storedHash = rows[0]?.password_hash || fakeHash;
  const valid = await bcrypt.compare(password, storedHash);

  if (!rows[0] || !valid) {
    const e = new Error('Invalid email or password');
    e.statusCode = 401;
    throw e;
  }

  const user = rows[0];

  if (!user.is_active) {
    const e = new Error('Account is deactivated');
    e.statusCode = 401;
    throw e;
  }

  const accessToken = signAccessToken(user.id, user.role);
  const { raw: refreshTokenRaw, hash: refreshTokenHash } = signRefreshToken(user.id);
  const expiresAt = refreshTokenExpiresAt();

  // Store hashed refresh token
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshTokenHash, expiresAt]
  );

  return {
    user: { id: user.id, email: user.email, role: user.role, employee_id: user.employee_id },
    accessToken,
    refreshTokenRaw,
  };
}

/**
 * Rotate refresh token — revoke old, issue new.
 * Returns { accessToken, refreshTokenRaw } or throws 401.
 */
async function refresh(rawToken) {
  if (!rawToken) {
    const e = new Error('No refresh token provided');
    e.statusCode = 401;
    throw e;
  }

  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find and validate the stored token
    const { rows } = await client.query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked,
              u.role, u.email, u.employee_id, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [hash]
    );

    const record = rows[0];
    if (!record || record.revoked || new Date(record.expires_at) < new Date() || !record.is_active) {
      const e = new Error('Invalid or expired refresh token');
      e.statusCode = 401;
      await client.query('ROLLBACK');
      throw e;
    }

    // Revoke old token
    await client.query(
      `UPDATE refresh_tokens SET revoked = true WHERE id = $1`,
      [record.id]
    );

    // Issue new refresh token
    const { raw: newRaw, hash: newHash } = signRefreshToken(record.user_id);
    const expiresAt = refreshTokenExpiresAt();
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [record.user_id, newHash, expiresAt]
    );

    await client.query('COMMIT');

    const accessToken = signAccessToken(record.user_id, record.role);
    return { accessToken, refreshTokenRaw: newRaw };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Logout — revoke the refresh token stored in the cookie.
 */
async function logout(rawToken) {
  if (!rawToken) return; // Already logged out
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await pool.query(
    `UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`,
    [hash]
  );
}

/**
 * Get current user from DB (fresh, not just from token payload).
 */
async function getMe(userId) {
  const { rows } = await pool.query(
    `SELECT id, email, role, employee_id, is_active, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!rows[0]) {
    const e = new Error('User not found');
    e.statusCode = 404;
    throw e;
  }
  return rows[0];
}

module.exports = { register, login, refresh, logout, getMe };
