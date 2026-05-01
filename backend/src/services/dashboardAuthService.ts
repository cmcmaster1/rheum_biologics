import crypto from 'node:crypto';
import { promisify } from 'node:util';

import { Request, Response } from 'express';

import { query } from '../db/pool.js';

const scrypt = promisify(crypto.scrypt);

const SESSION_COOKIE = 'dashboard_session';
const SESSION_DAYS = 7;
const PASSWORD_SCHEME = 'scrypt';
const PASSWORD_KEY_LENGTH = 64;

type DashboardAdmin = {
  id: string;
  email: string;
  password_hash: string | null;
};

export type DashboardSession = {
  adminId: string;
  email: string;
};

export const dashboardAdminEmail = () =>
  (process.env.DASHBOARD_ADMIN_EMAIL || 'mcmastc1@gmail.com').toLowerCase();

export const getDashboardStatus = async () => {
  const admin = await ensureDashboardAdmin();
  return {
    email: admin.email,
    passwordSet: Boolean(admin.password_hash)
  };
};

export const setupDashboardPassword = async (email: string, password: string, res: Response) => {
  const admin = await ensureDashboardAdmin();
  assertDashboardEmail(email, admin.email);
  validatePassword(password);

  if (admin.password_hash) {
    const error = new Error('Dashboard password has already been set');
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  await query(
    `
      UPDATE dashboard_admins
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [passwordHash, admin.id]
  );

  return createDashboardSession(admin.id, admin.email, res);
};

export const loginDashboard = async (email: string, password: string, res: Response) => {
  const admin = await ensureDashboardAdmin();
  assertDashboardEmail(email, admin.email);

  if (!admin.password_hash) {
    const error = new Error('Dashboard password has not been set');
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    const error = new Error('Invalid email or password');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  return createDashboardSession(admin.id, admin.email, res);
};

export const logoutDashboard = async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  if (token) {
    await query('DELETE FROM dashboard_sessions WHERE token_hash = $1', [hashToken(token)]);
  }

  clearSessionCookie(res);
};

export const requireDashboardSession = async (req: Request): Promise<DashboardSession> => {
  const token = getSessionToken(req);
  if (!token) {
    const error = new Error('Dashboard login required');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  const result = await query(
    `
      UPDATE dashboard_sessions session
      SET last_seen_at = CURRENT_TIMESTAMP
      FROM dashboard_admins admin
      WHERE
        session.admin_id = admin.id
        AND session.token_hash = $1
        AND session.expires_at > CURRENT_TIMESTAMP
      RETURNING admin.id, admin.email
    `,
    [hashToken(token)]
  );

  const row = result.rows[0];
  if (!row) {
    const error = new Error('Dashboard login expired');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }

  return {
    adminId: String(row.id),
    email: row.email
  };
};

const ensureDashboardAdmin = async (): Promise<DashboardAdmin> => {
  const email = dashboardAdminEmail();
  const result = await query(
    `
      INSERT INTO dashboard_admins (email)
      VALUES ($1)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, email, password_hash
    `,
    [email]
  );

  return result.rows[0];
};

const createDashboardSession = async (adminId: string, email: string, res: Response) => {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `
      INSERT INTO dashboard_sessions (admin_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `,
    [adminId, hashToken(token), expiresAt]
  );

  setSessionCookie(res, token);
  return { email };
};

const assertDashboardEmail = (providedEmail: string, expectedEmail: string) => {
  if (providedEmail.toLowerCase() !== expectedEmail.toLowerCase()) {
    const error = new Error('Invalid dashboard email');
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
};

const validatePassword = (password: string) => {
  if (password.length < 12) {
    const error = new Error('Password must be at least 12 characters');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
};

const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString('base64url');
  const key = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `${PASSWORD_SCHEME}$${salt}$${key.toString('base64url')}`;
};

const verifyPassword = async (password: string, storedHash: string) => {
  const [scheme, salt, expectedHash] = storedHash.split('$');
  if (scheme !== PASSWORD_SCHEME || !salt || !expectedHash) {
    return false;
  }

  const key = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(expectedHash, 'base64url');
  return expected.length === key.length && crypto.timingSafeEqual(key, expected);
};

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const getSessionToken = (req: Request) => {
  const cookieHeader = req.get('cookie');
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1)) : null;
};

const setSessionCookie = (res: Response, token: string) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${
      SESSION_DAYS * 24 * 60 * 60
    }${secure}`
  );
};

const clearSessionCookie = (res: Response) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
  );
};
