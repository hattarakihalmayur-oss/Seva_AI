/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint '${req.method} ${req.originalUrl}' not found on this server.`,
      code: 'RESOURCE_NOT_FOUND',
      statusCode: 404,
    },
  });
}

export default notFoundHandler;
