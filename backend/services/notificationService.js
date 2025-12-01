import logger from "../utils/logger.js";

/**
 * Notification Service
 * Placeholder for sending notifications to students and tutors
 * Can be extended with email, SMS, or in-app notification services
 */

/**
 * Notify student of successful match
 * @param {String} studentId - Student's user ID
 * @param {Object} tutorInfo - Matched tutor information
 * @param {Object} registrationInfo - Registration details
 */
export const notifyStudentMatchSuccess = async (studentId, tutorInfo, registrationInfo) => {
  try {
    logger.info("Notifying student of successful match", {
      studentId,
      tutorId: tutorInfo._id,
      subject: registrationInfo.subject
    });
    
    // TODO: Implement actual notification logic
    // Examples:
    // - Send email via SendGrid/Nodemailer
    // - Send SMS via Twilio
    // - Create in-app notification
    // - Send push notification
    
    console.log(`📧 [NOTIFICATION] Student ${studentId} matched with tutor ${tutorInfo.name}`);
    
    return {
      success: true,
      message: "Student notified successfully"
    };
  } catch (error) {
    logger.error("Failed to notify student", {
      error: error.message,
      studentId
    });
    // Don't throw error - notification failure shouldn't break the matching process
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Notify tutor of new match request
 * @param {String} tutorId - Tutor's ID
 * @param {Object} studentInfo - Student information
 * @param {Object} registrationInfo - Registration details
 */
export const notifyTutorNewRequest = async (tutorId, studentInfo, registrationInfo) => {
  try {
    logger.info("Notifying tutor of new match request", {
      tutorId,
      studentId: studentInfo._id,
      subject: registrationInfo.subject
    });
    
    // TODO: Implement actual notification logic
    
    console.log(`📧 [NOTIFICATION] Tutor ${tutorId} has new request from student ${studentInfo.fullname || studentInfo.email}`);
    
    return {
      success: true,
      message: "Tutor notified successfully"
    };
  } catch (error) {
    logger.error("Failed to notify tutor", {
      error: error.message,
      tutorId
    });
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Notify coordinator for manual review
 * @param {String} registrationId - Registration ID that needs review
 * @param {String} reason - Reason for coordinator review
 */
export const notifyCoordinatorReview = async (registrationId, reason) => {
  try {
    logger.info("Notifying coordinator for review", {
      registrationId,
      reason
    });
    
    // TODO: Implement actual notification logic
    // - Send email to coordinator
    // - Create dashboard alert
    
    console.log(`📧 [NOTIFICATION] Coordinator review needed for registration ${registrationId}: ${reason}`);
    
    return {
      success: true,
      message: "Coordinator notified successfully"
    };
  } catch (error) {
    logger.error("Failed to notify coordinator", {
      error: error.message,
      registrationId
    });
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Notify student that request is under coordinator review
 * @param {String} studentId - Student's user ID
 * @param {Object} registrationInfo - Registration details
 */
export const notifyStudentCoordinatorReview = async (studentId, registrationInfo) => {
  try {
    logger.info("Notifying student of coordinator review", {
      studentId,
      registrationId: registrationInfo._id
    });
    
    // TODO: Implement actual notification logic
    
    console.log(`📧 [NOTIFICATION] Student ${studentId} - request under coordinator review`);
    
    return {
      success: true,
      message: "Student notified of coordinator review"
    };
  } catch (error) {
    logger.error("Failed to notify student of coordinator review", {
      error: error.message,
      studentId
    });
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Notify student of automatic session enrollment
 * @param {String} studentId - Student's user ID
 * @param {Object} session - Session information
 * @param {Object} registrationInfo - Registration details
 */
export const notifyStudentSessionEnrollment = async (studentId, session, registrationInfo) => {
  try {
    const Notification = (await import("../models/notificationModel.js")).default;
    
    const sessionDates = session.getSessionDates ? session.getSessionDates() : [];
    const firstDate = sessionDates[0] || { 
      date: session.startDate, 
      start: Object.values(session.schedule)[0]?.[0]?.start || "N/A",
      end: Object.values(session.schedule)[0]?.[0]?.end || "N/A"
    };
    
    await Notification.create({
      user: studentId,
      studentId: studentId,
      title: "Enrolled in Session!",
      message: `You've been automatically enrolled in ${session.subject} with ${session.tutor.name}`,
      type: "SESSION_ENROLLMENT",
      relatedSession: session._id,
      metadata: {
        tutorName: session.tutor.name,
        subject: session.subject,
        date: firstDate.date instanceof Date ? firstDate.date.toISOString().split("T")[0] : firstDate.date,
        startTime: firstDate.start,
        endTime: firstDate.end,
        location: session.location
      }
    });
    
    logger.info("Student notified of session enrollment", {
      studentId,
      sessionId: session._id,
      subject: session.subject
    });
    
    console.log(`📧 [NOTIFICATION] Student ${studentId} enrolled in session ${session._id}`);
    
    return {
      success: true,
      message: "Student notified of session enrollment"
    };
  } catch (error) {
    logger.error("Failed to notify student of session enrollment", {
      error: error.message,
      studentId
    });
    return {
      success: false,
      message: error.message
    };
  }
};
