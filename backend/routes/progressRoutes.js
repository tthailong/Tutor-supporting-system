import express from "express";
import {
  saveProgressDraft,
  submitProgress,
  getStudentSessionProgress,
  getTutorProgressRecords,
  getStudentProgressRecords,
  deleteProgress
} from "../controllers/studentProgressController.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const progressRouter = express.Router();

// All routes require authentication
progressRouter.use(authMiddleware);

// Tutor routes
progressRouter.post("/students/:studentId/sessions/:sessionId/draft", requireRole("Tutor"), saveProgressDraft);
progressRouter.put("/students/:studentId/sessions/:sessionId/submit", requireRole("Tutor"), submitProgress);
progressRouter.get("/students/:studentId/sessions/:sessionId", requireRole("Tutor"), getStudentSessionProgress);
progressRouter.get("/tutors/me", requireRole("Tutor"), getTutorProgressRecords);
progressRouter.delete("/students/:studentId/sessions/:sessionId", requireRole("Tutor"), deleteProgress);

// Student routes
progressRouter.get("/students/me", requireRole("Student"), getStudentProgressRecords);

export default progressRouter;