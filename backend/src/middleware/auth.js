import { findUserByToken } from '../services/auth.service.js';

export function parseToken(request) {
  const authorization = request.headers.authorization ?? '';
  return authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;
}

export async function requireAdmin(request, response, next) {
  const user = await findUserByToken(parseToken(request));

  if (!user || user.role !== 'admin') {
    response.status(401).json({ message: 'Admin authentication required.' });
    return;
  }

  request.user = user;
  next();
}
