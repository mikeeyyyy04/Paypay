const allowedOrigins = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5174',
  'http://127.0.0.1:5175',
  'http://localhost:5175',
]);

export function corsMiddleware(request, response, next) {
  const origin = request.headers.origin;
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : 'http://127.0.0.1:5173';

  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  response.setHeader('Vary', 'Origin');

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
}
