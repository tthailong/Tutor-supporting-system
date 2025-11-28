import logger from "../utils/logger.js";

/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized error responses
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.logError(err, {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    user: req.user?.id
  });
  
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }
  
  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
  
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" 
    ? "Internal server error" 
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
};

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
};
