import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authorization header must be in format: Bearer <token>"
      });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }
    
    // Attach user info to request
    req.user = {
      id: userId,
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    logger.error("Authentication failed", {
      error: error.message,
      path: req.path
    });
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`
      });
    }
    
    next();
  };
};
