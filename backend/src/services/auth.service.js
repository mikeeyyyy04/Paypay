import crypto from 'node:crypto';
import { prisma } from '../database/prisma.js';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@paypay.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!';

function tokenSecret() {
  return process.env.AUTH_TOKEN_SECRET ?? process.env.SESSION_SECRET ?? 'paypay-dev-secret';
}

function sign(payload) {
  return crypto.createHmac('sha256', tokenSecret()).update(payload).digest('hex');
}

function encodeTokenPayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeTokenPayload(payload) {
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

export function publicUser(user) {
  return {
    name: user.fullName ?? user.name ?? user.email,
    email: user.email,
    role: user.role ?? 'admin',
  };
}

export function createToken(user) {
  const payload = encodeTokenPayload({ email: user.email, exp: Date.now() + TOKEN_TTL_MS });
  return `${payload}.${sign(payload)}`;
}

export async function findUserByToken(token) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || signature !== sign(payload)) {
    return null;
  }

  const decoded = decodeTokenPayload(payload);

  if (!decoded.email || Number(decoded.exp) < Date.now()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: decoded.email,
    },
  });

  if (!user) {
    return null;
  }

  // Use the configured admin email instead of user_roles
  if (decoded.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  return {
    ...user,
    role: "admin",
  };
}

export async function loginAdmin({ email, password }) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();

  if (normalizedEmail !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      fullName: process.env.ADMIN_NAME ?? 'Admin User',
    },
    update: {
      lastLoginAt: new Date(),
    },
  });

  const adminUser = { ...user, role: 'admin' };
  const token = createToken(adminUser);

  return { token, user: publicUser(adminUser) };
}
