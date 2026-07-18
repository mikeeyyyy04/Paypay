import crypto from 'node:crypto';

export function publicUser(user) {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function findUserByToken(database, token) {
  const userId = token ? database.sessions[token] : null;
  return database.users.find((user) => user.id === userId) ?? null;
}
