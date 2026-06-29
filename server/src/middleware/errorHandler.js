

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Default to 500 if no status code was set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;