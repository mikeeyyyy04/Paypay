const allowedOrigins = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5174',
  'http://127.0.0.1:5175',
  'http://localhost:5175',
]);

function corsHeaders(request) {
  const origin = request.headers.origin;
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : 'http://127.0.0.1:5173';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    Vary: 'Origin',
  };
}

export async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function sendJson(request, response, statusCode, body) {
  response.writeHead(statusCode, {
    ...corsHeaders(request),
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(body));
}

export function sendNoContent(request, response) {
  response.writeHead(204, {
    ...corsHeaders(request),
  });
  response.end();
}

export function parseToken(request) {
  const authorization = request.headers.authorization ?? '';
  return authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;
}
