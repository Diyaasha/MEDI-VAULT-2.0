const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: "Invalid JSON payload in request body",
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
