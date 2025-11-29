import asyncHandler from "express-async-handler";
import SessionEvaluation from "../models/sessionEvaluationModel.js";
import Session from "../models/sessionModel.js";
import logger from "../utils/logger.js";

/**
 * POST /api/evaluations/sessions/:sessionId/draft
 * Save evaluation as draft
 */
export const saveEvaluationDraft = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { rating, comments } = req.body;
  const studentId = req.user.id;

  // Validate session exists and student is enrolled
  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found"
    });
  }

  if (!session.students.includes(studentId)) {
    return res.status(403).json({
      success: false,
      message: "You are not enrolled in this session"
    });
  }

  // Create or update draft evaluation
  const evaluation = await SessionEvaluation.findOneAndUpdate(
    {
      student: studentId,
      session: sessionId,
      status: "draft"
    },
    {
      student: studentId,
      session: sessionId,
      tutor: session.tutor,
      rating,
      comments,
      status: "draft"
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  logger.info("Evaluation draft saved", {
    evaluationId: evaluation._id,
    studentId,
    sessionId,
    rating
  });

  res.status(200).json({
    success: true,
    message: "Evaluation draft saved successfully",
    data: evaluation
  });
});

/**
 * PUT /api/evaluations/sessions/:sessionId/submit
 * Submit final evaluation
 */
export const submitEvaluation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { rating, comments } = req.body;
  const studentId = req.user.id;

  // Validate session exists and student is enrolled
  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found"
    });
  }

  if (!session.students.includes(studentId)) {
    return res.status(403).json({
      success: false,
      message: "You are not enrolled in this session"
    });
  }

  // Submit evaluation (create new or update draft)
  const evaluation = await SessionEvaluation.findOneAndUpdate(
    {
      student: studentId,
      session: sessionId
    },
    {
      student: studentId,
      session: sessionId,
      tutor: session.tutor,
      rating,
      comments,
      status: "submitted"
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  logger.info("Evaluation submitted", {
    evaluationId: evaluation._id,
    studentId,
    sessionId,
    rating,
    status: evaluation.status
  });

  res.status(200).json({
    success: true,
    message: "Evaluation submitted successfully",
    data: evaluation
  });
});

/**
 * GET /api/evaluations/sessions/:sessionId
 * Get evaluation for a specific session (draft or submitted)
 */
export const getSessionEvaluation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user.id;

  const evaluation = await SessionEvaluation.findOne({
    student: studentId,
    session: sessionId
  }).populate("session", "name subject");

  res.status(200).json({
    success: true,
    data: evaluation
  });
});

/**
 * GET /api/evaluations/students/me
 * Get all evaluations by current student
 */
export const getMyEvaluations = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const evaluations = await SessionEvaluation.find({
    student: studentId
  })
    .populate("session", "name subject tutor")
    .populate("tutor", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: evaluations.length,
    data: evaluations
  });
});

/**
 * GET /api/evaluations/tutors/me
 * Get all evaluations for tutor's sessions
 */
export const getTutorEvaluations = asyncHandler(async (req, res) => {
  const tutorId = req.user.id;

  const evaluations = await SessionEvaluation.find({
    tutor: tutorId,
    status: "submitted"
  })
    .populate("session", "name subject")
    .populate("student", "fullname email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: evaluations.length,
    data: evaluations
  });
});

/**
 * DELETE /api/evaluations/sessions/:sessionId
 * Delete evaluation (only draft can be deleted)
 */
export const deleteEvaluation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const studentId = req.user.id;

  const evaluation = await SessionEvaluation.findOneAndDelete({
    student: studentId,
    session: sessionId,
    status: "draft"
  });

  if (!evaluation) {
    return res.status(404).json({
      success: false,
      message: "Draft evaluation not found or already submitted"
    });
  }

  logger.info("Evaluation draft deleted", {
    evaluationId: evaluation._id,
    studentId,
    sessionId
  });

  res.status(200).json({
    success: true,
    message: "Evaluation draft deleted successfully"
  });
});