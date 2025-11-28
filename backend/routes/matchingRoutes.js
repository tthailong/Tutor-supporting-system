import express from "express";
import {
  getTutors,
  createManualMatchRequest,
  autoMatch,
  getMyRequests
} from "../controllers/matchingController.js";
import {
  validateManualMatchRequest,
  validateAutoMatchRequest,
  validateTutorFilters
} from "../validators/matchingValidator.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const matchingRouter = express.Router();

// --------------------
// PUBLIC ROUTES (or with optional auth)
// --------------------

// Get tutors with filtering (Marketplace)
matchingRouter.get(
  "/tutors",
  validateTutorFilters,
  getTutors
);

// --------------------
// PROTECTED ROUTES (require authentication)
// --------------------

// Create manual match request
matchingRouter.post(
  "/manual",
  authMiddleware,
  requireRole("Student"),
  validateManualMatchRequest,
  createManualMatchRequest
);

// Auto-match algorithm
matchingRouter.post(
  "/auto",
  authMiddleware,
  requireRole("Student"),
  validateAutoMatchRequest,
  autoMatch
);

// Get student's match requests
matchingRouter.get(
  "/my-requests",
  authMiddleware,
  requireRole("Student"),
  getMyRequests
);

export default matchingRouter;
