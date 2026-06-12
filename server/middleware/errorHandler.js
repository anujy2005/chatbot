/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  // OpenAI specific errors
  if (err.status === 401 || err.code === 'invalid_api_key') {
    return res.status(500).json({
      error: 'Invalid OpenAI API key. Please check your .env file.'
    });
  }

  if (err.status === 429) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment and try again.'
    });
  }

  if (err.code === 'insufficient_quota') {
    return res.status(402).json({
      error: 'OpenAI API quota exceeded. Please check your billing.'
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

module.exports = errorHandler;
