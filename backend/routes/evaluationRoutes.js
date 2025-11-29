import express from "express";
import {
  saveEvaluationDraft,
  submitEvaluation,
  getSessionEvaluation,
  getMyEvaluations,
  getTutorEvaluations,
  deleteEvaluation
} from "../controllers/sessionEvaluationController.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const evaluationRouter = express.Router();

// All routes require authentication
evaluationRouter.use(authMiddleware);

// Student routes
evaluationRouter.post("/sessions/:sessionId/draft", requireRole("Student"), saveEvaluationDraft);
evaluationRouter.put("/sessions/:sessionId/submit", requireRole("Student"), submitEvaluation);
evaluationRouter.get("/sessions/:sessionId", requireRole("Student"), getSessionEvaluation);
evaluationRouter.get("/students/me", requireRole("Student"), getMyEvaluations);
evaluationRouter.delete("/sessions/:sessionId", requireRole("Student"), deleteEvaluation);

// Tutor routes
evaluationRouter.get("/tutors/me", requireRole("Tutor"), getTutorEvaluations);

export default evaluationRouter;