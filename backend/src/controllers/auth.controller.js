import { findUserByToken, loginAdmin, publicUser } from '../services/auth.service.js';
import { parseToken } from '../middleware/auth.js';

export async function login(request, response) {
  const session = await loginAdmin(request.body);

  if (!session) {
    response.status(401).json({ message: 'Invalid admin credentials.' });
    return;
  }

  response.status(200).json(session);
}

export async function getCurrentUser(request, response) {
  const user = await findUserByToken(parseToken(request));

  if (!user) {
    response.status(401).json({ message: 'Session expired.' });
    return;
  }

  response.status(200).json(publicUser(user));
}

export async function logout(request, response) {
  response.sendStatus(204);
}
