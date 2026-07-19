export function notFoundHandler(request, response) {
  response.status(404).json({ message: 'Route not found.' });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  response.status(error.statusCode ?? 500).json({
    message: error instanceof Error ? error.message : 'Unexpected server error.',
  });
}
