import asyncHandler from "express-async-handler";
import tutorModel from "../models/tutorModel.js";
import registrationModel from "../models/registrationModel.js";
import tutorMatchLogModel from "../models/tutorMatchLogModel.js";
import User from "../models/User.js";
import { withTransaction } from "../utils/transactionHelper.js";
import logger from "../utils/logger.js";
import {
  notifyStudentMatchSuccess,
  notifyTutorNewRequest,
  notifyCoordinatorReview,
  notifyStudentCoordinatorReview
} from "../services/notificationService.js";

// --------------------
// HELPER FUNCTIONS
// --------------------

/**
 * Check if tutor has availability overlap with requested time slots
 * @param {Map} tutorAvailability - Tutor's availability map
 * @param {Array} requestedSlots - Array of {dayOfWeek, startTime, endTime}
 * @returns {Boolean} True if there's overlap
 */
const checkTimeSlotOverlap = (tutorAvailability, requestedSlots) => {
  if (!tutorAvailability || Object.keys(tutorAvailability).length === 0) {
    return false;
  }
  
  // For simplicity, check if tutor has any availability on the requested days
  // In production, you'd want more sophisticated time overlap checking
  for (const slot of requestedSlots) {
    // Check if tutor has any slots on this day
    // Use Object.entries() because .lean() converts Map to plain object
    for (const [date, timeSlots] of Object.entries(tutorAvailability)) {
      const dateObj = new Date(date);
      const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
      
      if (dayOfWeek === slot.dayOfWeek) {
        // Check if any time slot overlaps
        for (const tutorSlot of timeSlots) {
          if (tutorSlot.start <= slot.startTime && tutorSlot.end >= slot.endTime) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};

/**
 * Check if tutor's time slot is available (not booked)
 * @param {Array} bookedSlots - Tutor's booked slots
 * @param {Array} requestedSlots - Requested time slots
 * @returns {Boolean} True if slot is available
 */
const isSlotAvailable = (bookedSlots, requestedSlots) => {
  for (const requested of requestedSlots) {
    for (const booked of bookedSlots) {
      const bookedDate = new Date(booked.date);
      const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][bookedDate.getDay()];
      
      if (dayOfWeek === requested.dayOfWeek) {
        // Check time overlap
        if (
          (requested.startTime >= booked.startTime && requested.startTime < booked.endTime) ||
          (requested.endTime > booked.startTime && requested.endTime <= booked.endTime)
        ) {
          return false; // Slot is booked
        }
      }
    }
  }
  
  return true; // Slot is available
};

// --------------------
// CONTROLLER FUNCTIONS
// --------------------

/**
 * GET /api/tutors
 * Get list of tutors with filtering (Manual Matching - Marketplace)
 */
export const getTutors = asyncHandler(async (req, res) => {
  const {
    subject,
    minRating,
    dayOfWeek,
    startTime,
    endTime,
    page,
    limit
  } = req.validatedQuery;
  
  // Build query
  const query = {};
  
  if (subject) {
    query.expertise = subject;
  }
  
  if (minRating) {
    query.rating = { $gte: minRating };
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  let tutors = await tutorModel
    .find(query)
    .select("-bookedSlots") // Exclude booked slots for performance
    .sort({ rating: -1 }) // Sort by rating descending
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Filter by availability if day/time specified
  if (dayOfWeek || (startTime && endTime)) {
    tutors = tutors.filter(tutor => {
      if (!tutor.availability) return false;
      
      // Check if tutor has availability on the specified day
      for (const [date, slots] of Object.entries(tutor.availability)) {
        const dateObj = new Date(date);
        const tutorDayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
        
        if (dayOfWeek && tutorDayOfWeek !== dayOfWeek) continue;
        
        // Check time overlap
        if (startTime && endTime) {
          const hasTimeOverlap = slots.some(slot => 
            slot.start <= startTime && slot.end >= endTime
          );
          if (hasTimeOverlap) return true;
        } else {
          return true; // Day matches, no time filter
        }
      }
      
      return false;
    });
  }
  
  // Get total count for pagination
  const total = await tutorModel.countDocuments(query);
  
  // Format response with summarized availability
  const formattedTutors = tutors.map(tutor => ({
    _id: tutor._id,
    name: tutor.name,
    expertise: tutor.expertise,
    bio: tutor.bio,
    rating: tutor.rating,
    totalSessions: tutor.totalSessions,
    activeStudents: tutor.activeStudents,
    availabilityDays: tutor.availability 
      ? Object.keys(tutor.availability).length 
      : 0
  }));
  
  res.status(200).json({
    success: true,
    tutors: formattedTutors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * POST /api/matching/manual
 * Create manual match request
 */
export const createManualMatchRequest = asyncHandler(async (req, res) => {
  const { tutorId, subject, description, preferredTimeSlots } = req.body;
  
  // For testing: use hardcoded student ID if auth is disabled
  const studentId = req.user?.id || '69285ff4fcc2424d7f1b9234';
  
  // Use transaction to prevent race conditions
  const result = await withTransaction(async (session) => {
    // 1. Verify tutor exists
    const tutor = await tutorModel.findById(tutorId).session(session);
    
    if (!tutor) {
      const error = new Error("Tutor not found");
      error.statusCode = 404;
      throw error;
    }
    
    // 2. Check if preferred time slots are available
    const slotsAvailable = isSlotAvailable(tutor.bookedSlots, preferredTimeSlots);
    
    if (!slotsAvailable) {
      const error = new Error("One or more requested time slots are already booked");
      error.statusCode = 409;
      throw error;
    }
    
    // 3. Create registration document
    const registration = await registrationModel.create([{
      studentId,
      tutorId,
      subject,
      description,
      preferredTimeSlots,
      status: "Pending",
      type: "Manual"
    }], { session });
    
    return { registration: registration[0], tutor };
  });
  
  // 4. Notify tutor (outside transaction)
  const student = await User.findById(studentId);
  await notifyTutorNewRequest(tutorId, student, result.registration);
  
  logger.info("Manual match request created", {
    registrationId: result.registration._id,
    studentId,
    tutorId,
    subject
  });
  
  res.status(201).json({
    success: true,
    message: "Match request submitted successfully",
    registration: result.registration
  });
});

/**
 * POST /api/matching/auto
 * Auto-match algorithm
 */
export const autoMatch = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { subject, description, availableTimeSlots, priorityLevel } = req.validatedData;
  
  // For testing: use hardcoded student ID if auth is disabled
  const studentId = req.user?.id || '69285ff4fcc2424d7f1b9234';
  
  try {
    // --------------------
    // STEP 1: Filter tutors by subject
    // --------------------
    const candidateTutors = await tutorModel.find({
      expertise: subject
    }).lean();
    
    if (candidateTutors.length === 0) {
      // No tutors available - escalate to coordinator
      const registration = await registrationModel.create({
        studentId,
        tutorId: null,
        subject,
        description,
        preferredTimeSlots: availableTimeSlots,
        status: "Coordinator_Review",
        type: "Auto",
        matchScore: 0,
        processingTime: Date.now() - startTime
      });
      
      // Log the attempt
      await tutorMatchLogModel.create({
        registrationId: registration._id,
        attemptedAt: new Date(),
        success: false,
        matchScore: 0,
        processingTime: Date.now() - startTime,
        failureReason: "No tutors available for subject",
        candidateTutors: []
      });
      
      await notifyCoordinatorReview(registration._id, "No tutors available for subject");
      await notifyStudentCoordinatorReview(studentId, registration);
      
      logger.warn("Auto-match failed - no tutors available", {
        subject,
        studentId
      });
      
      return res.status(200).json({
        success: true,
        message: "No tutors currently available. Your request has been queued for coordinator review.",
        registration,
        status: "Coordinator_Review"
      });
    }
    
    // --------------------
    // STEP 2: Score each tutor
    // --------------------
    const scoredTutors = candidateTutors.map(tutor => {
      let score = 0;
      
      // +10 points for exact time slot overlap
      const hasOverlap = checkTimeSlotOverlap(tutor.availability, availableTimeSlots);
      if (hasOverlap) {
        score += 10;
      }
      
      // +5 points for high rating (>4.5)
      if (tutor.rating > 4.5) {
        score += 5;
      }
      
      // +2 points for low workload (activeStudents < 5)
      if (tutor.activeStudents < 5) {
        score += 2;
      }
      
      return {
        tutor,
        score
      };
    });
    
    // --------------------
    // STEP 3: Select best match
    // --------------------
    scoredTutors.sort((a, b) => b.score - a.score);
    const bestMatch = scoredTutors[0];
    
    logger.info("Auto-match scoring complete", {
      subject,
      candidateCount: candidateTutors.length,
      topScore: bestMatch.score,
      topTutorId: bestMatch.tutor._id
    });
    
    // --------------------
    // STEP 4: Threshold check
    // --------------------
    const MATCH_THRESHOLD = 10;
    
    if (bestMatch.score < MATCH_THRESHOLD) {
      // Score too low - escalate to coordinator
      const registration = await registrationModel.create({
        studentId,
        tutorId: null,
        subject,
        description,
        preferredTimeSlots: availableTimeSlots,
        status: "Coordinator_Review",
        type: "Auto",
        matchScore: bestMatch.score,
        processingTime: Date.now() - startTime
      });
      
      // Log the attempt
      await tutorMatchLogModel.create({
        registrationId: registration._id,
        attemptedAt: new Date(),
        success: false,
        matchScore: bestMatch.score,
        processingTime: Date.now() - startTime,
        failureReason: `Best match score (${bestMatch.score}) below threshold (${MATCH_THRESHOLD})`,
        candidateTutors: scoredTutors.map(st => ({
          tutorId: st.tutor._id,
          score: st.score
        }))
      });
      
      await notifyCoordinatorReview(
        registration._id, 
        `Best match score (${bestMatch.score}) below threshold`
      );
      await notifyStudentCoordinatorReview(studentId, registration);
      
      logger.warn("Auto-match failed - score below threshold", {
        subject,
        studentId,
        bestScore: bestMatch.score,
        threshold: MATCH_THRESHOLD
      });
      
      return res.status(200).json({
        success: true,
        message: "No suitable match found. Your request has been queued for coordinator review.",
        registration,
        status: "Coordinator_Review"
      });
    }
    
    // --------------------
    // STEP 5: Create matched registration
    // --------------------
    const registration = await registrationModel.create({
      studentId,
      tutorId: bestMatch.tutor._id,
      subject,
      description,
      preferredTimeSlots: availableTimeSlots,
      status: "Matched",
      type: "Auto",
      matchScore: bestMatch.score,
      processingTime: Date.now() - startTime
    });
    
    // Log successful match
    await tutorMatchLogModel.create({
      registrationId: registration._id,
      attemptedAt: new Date(),
      success: true,
      matchScore: bestMatch.score,
      processingTime: Date.now() - startTime,
      candidateTutors: scoredTutors.slice(0, 5).map(st => ({
        tutorId: st.tutor._id,
        score: st.score
      })),
      selectedTutorId: bestMatch.tutor._id
    });
    
    // Notify student and tutor
    const student = await User.findById(studentId);
    await notifyStudentMatchSuccess(studentId, bestMatch.tutor, registration);
    await notifyTutorNewRequest(bestMatch.tutor._id, student, registration);
    
    logger.info("Auto-match successful", {
      registrationId: registration._id,
      studentId,
      tutorId: bestMatch.tutor._id,
      matchScore: bestMatch.score,
      processingTime: Date.now() - startTime
    });
    
    res.status(201).json({
      success: true,
      message: "Match found successfully!",
      registration,
      matchedTutor: {
        _id: bestMatch.tutor._id,
        name: bestMatch.tutor.name,
        rating: bestMatch.tutor.rating,
        expertise: bestMatch.tutor.expertise,
        bio: bestMatch.tutor.bio
      },
      matchScore: bestMatch.score
    });
    
  } catch (error) {
    // Error recovery - save request with Processing_Error status
    logger.logError(error, {
      context: "Auto-match algorithm",
      studentId,
      subject
    });
    
    try {
      const errorRegistration = await registrationModel.create({
        studentId,
        tutorId: null,
        subject,
        description,
        preferredTimeSlots: availableTimeSlots,
        status: "Coordinator_Review",
        type: "Auto",
        matchScore: 0,
        processingTime: Date.now() - startTime
      });
      
      await notifyCoordinatorReview(
        errorRegistration._id,
        `Processing error: ${error.message}`
      );
      
      logger.info("Error registration created for retry", {
        registrationId: errorRegistration._id
      });
    } catch (recoveryError) {
      logger.error("Failed to create error registration", {
        error: recoveryError.message
      });
    }
    
    throw error;
  }
});

/**
 * GET /api/matching/my-requests
 * Get student's match requests
 */
export const getMyRequests = asyncHandler(async (req, res) => {
  // For testing: use hardcoded student ID if auth is disabled
  const studentId = req.user?.id || '69285ff4fcc2424d7f1b9234';
  
  const requests = await registrationModel
    .find({ studentId })
    .populate("tutorId", "name rating expertise bio")
    .sort({ createdAt: -1 })
    .lean();
  
  // Add status colors
  const formattedRequests = requests.map(request => ({
    ...request,
    statusColor: getStatusColor(request.status)
  }));
  
  res.status(200).json({
    success: true,
    requests: formattedRequests
  });
});

/**
 * Helper: Get status color
 */
const getStatusColor = (status) => {
  const colorMap = {
    "Pending": "yellow",
    "Matched": "green",
    "Rejected": "red",
    "Coordinator_Review": "orange"
  };
  return colorMap[status] || "gray";
};
