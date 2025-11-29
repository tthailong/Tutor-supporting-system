import asyncHandler from "express-async-handler";
import StudentProgress from "../models/studentProgressModel.js";
import Session from "../models/sessionModel.js";
import logger from "../utils/logger.js";

/**
 * POST /api/progress/students/:studentId/sessions/:sessionId/draft
 * Save progress record as draft
 */
export const saveProgressDraft = asyncHandler(async (req, res) => {
  const { studentId, sessionId } = req.params;
  const { strengths, areasForImprovement, recommendations, overallProgress } = req.body;
  const tutorId = req.user.id;

  // Verify tutor has access to this session and student
  const session = await Session.findOne({
    _id: sessionId,
    tutor: tutorId,
    students: studentId
  });

  if (!session) {
    return res.status(403).json({
      success: false,
      message: "You don't have access to this student's session"
    });
  }

  // Create or update draft progress
  const progress = await StudentProgress.findOneAndUpdate(
    {
      tutor: tutorId,
      student: studentId,
      session: sessionId,
      status: "draft"
    },
    {
      tutor: tutorId,
      student: studentId,
      session: sessionId,
      strengths,
      areasForImprovement,
      recommendations,
      overallProgress,
      status: "draft"
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  ).populate("student", "fullname email");

  logger.info("Progress draft saved", {
    progressId: progress._id,
    tutorId,
    studentId,
    sessionId
  });

  res.status(200).json({
    success: true,
    message: "Progress draft saved successfully",
    data: progress
  });
});

/**
 * PUT /api/progress/students/:studentId/sessions/:sessionId/submit
 * Submit final progress record
 */
export const submitProgress = asyncHandler(async (req, res) => {
  const { studentId, sessionId } = req.params;
  const { strengths, areasForImprovement, recommendations, overallProgress } = req.body;
  const tutorId = req.user.id;

  // Verify tutor has access to this session and student
  const session = await Session.findOne({
    _id: sessionId,
    tutor: tutorId,
    students: studentId
  });

  if (!session) {
    return res.status(403).json({
      success: false,
      message: "You don't have access to this student's session"
    });
  }

  // Submit progress (create new or update draft)
  const progress = await StudentProgress.findOneAndUpdate(
    {
      tutor: tutorId,
      student: studentId,
      session: sessionId
    },
    {
      tutor: tutorId,
      student: studentId,
      session: sessionId,
      strengths,
      areasForImprovement,
      recommendations,
      overallProgress,
      status: "submitted"
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  ).populate("student", "fullname email");

  logger.info("Progress submitted", {
    progressId: progress._id,
    tutorId,
    studentId,
    sessionId,
    status: progress.status
  });

  res.status(200).json({
    success: true,
    message: "Progress record submitted successfully",
    data: progress
  });
});

/**
 * GET /api/progress/students/:studentId/sessions/:sessionId
 * Get progress record for specific student and session
 */
export const getStudentSessionProgress = asyncHandler(async (req, res) => {
  const { studentId, sessionId } = req.params;
  const tutorId = req.user.id;

  const progress = await StudentProgress.findOne({
    tutor: tutorId,
    student: studentId,
    session: sessionId
  })
    .populate("student", "fullname email")
    .populate("session", "name subject");

  res.status(200).json({
    success: true,
    data: progress
  });
});

/**
 * GET /api/progress/tutors/me
 * Get all progress records by current tutor
 */
export const getTutorProgressRecords = asyncHandler(async (req, res) => {
  const tutorId = req.user.id;

  const progressRecords = await StudentProgress.find({
    tutor: tutorId
  })
    .populate("student", "fullname email")
    .populate("session", "name subject")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: progressRecords.length,
    data: progressRecords
  });
});

/**
 * GET /api/progress/students/me
 * Get all progress records about current student
 */
export const getStudentProgressRecords = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const progressRecords = await StudentProgress.find({
    student: studentId,
    status: "submitted"
  })
    .populate("tutor", "name")
    .populate("session", "name subject")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: progressRecords.length,
    data: progressRecords
  });
});

/**
 * DELETE /api/progress/students/:studentId/sessions/:sessionId
 * Delete progress record (only draft can be deleted)
 */
export const deleteProgress = asyncHandler(async (req, res) => {
  const { studentId, sessionId } = req.params;
  const tutorId = req.user.id;

  const progress = await StudentProgress.findOneAndDelete({
    tutor: tutorId,
    student: studentId,
    session: sessionId,
    status: "draft"
  });

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: "Draft progress record not found or already submitted"
    });
  }

  logger.info("Progress draft deleted", {
    progressId: progress._id,
    tutorId,
    studentId,
    sessionId
  });

  res.status(200).json({
    success: true,
    message: "Progress draft deleted successfully"
  });
});