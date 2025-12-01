import Session from "../models/sessionModel.js";
import Tutor from "../models/tutorModel.js";
import Registration from "../models/registrationModel.js";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js"; // Assuming you have this model
import User from "../models/User.js";
import Student from "../models/studentModel.js";

// Helper: 07:00 -> 700
const parseTime = (t) => parseInt(t.replace(":", ""));

// ---------------------------------------------------
// CREATE SESSION  (FULLY REWRITTEN & CORRECT)
// ---------------------------------------------------
export const createSession = async (req, res) => {
  try {
    const { tutorId, subject, location, schedule, duration, capacity, description, registrationId, studentIdToEnroll } = req.body;

    // --------------------------
    // 1. Validate tutor exists
    // --------------------------
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    // --------------------------
    // 2. Temporarily build session to extract dates
    // --------------------------
    const tempSession = new Session({ schedule, duration, startDate: new Date() });
    const newSessionDates = tempSession.getSessionDates();
    // -> [{ date: DateObj, start: "08:00", end: "10:00" }, ...]


    // --------------------------
    // 3. CHECK CONFLICT with Tutor.bookedSlots (Map)
    // --------------------------
    for (const slot of newSessionDates) {
      const dateKey = slot.date.toISOString().split("T")[0];

      const existingBookings = tutor.bookedSlots.get(dateKey) || [];

      const newStart = parseTime(slot.start);
      const newEnd = parseTime(slot.end);

      for (const booked of existingBookings) {
        const bStart = parseTime(booked.start);
        const bEnd = parseTime(booked.end);

        // Overlap formula: A.start < B.end AND A.end > B.start
        if (newStart < bEnd && newEnd > bStart) {
          return res.status(400).json({
            message: `Tutor already booked on ${dateKey} from ${booked.start} to ${booked.end}`
          });
        }
      }
    }


    // --------------------------
    // 4. CREATE AND SAVE SESSION
    // --------------------------
    const expandedSchedule = new Map();

    let initialStudents = [];
    if (studentIdToEnroll) {
      // Find the Student Profile document where the userId field matches the ID passed from the notification
      const studentProfile = await Student.findOne({ userId: studentIdToEnroll });

      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found for enrollment." });
      }

      // 🛑 Use the Student Profile's primary ID (Student._id)
      initialStudents.push(studentProfile._id);
    }
    // Get the start date from the original schedule
    const originalDates = Object.keys(schedule).sort(); // e.g., ["2025-11-28"]
    const durationWeeks = duration || 1;

    for (let week = 0; week < durationWeeks; week++) {
      originalDates.forEach(dateStr => {
        const baseDate = new Date(dateStr);
        baseDate.setDate(baseDate.getDate() + 7 * week);
        const newDateKey = baseDate.toISOString().split("T")[0];

        expandedSchedule.set(newDateKey, schedule[dateStr]);
      });
    }

    const newSession = new Session({
      subject,
      tutor: tutor._id,
      location,
      schedule: expandedSchedule,
      duration,
      startDate: newSessionDates.length ? newSessionDates[0].date : new Date(),
      capacity,
      description,
      students: initialStudents,
    });

    await newSession.save();


    // --------------------------
    // 5. WRITE BOOKED SLOTS INTO TUTOR.bookedSlots
    // --------------------------
    newSessionDates.forEach(slot => {
      const dateKey = slot.date.toISOString().split("T")[0];

      const today = tutor.bookedSlots.get(dateKey) || [];

      today.push({
        start: slot.start,
        end: slot.end,
        sessionId: newSession._id
      });

      tutor.bookedSlots.set(dateKey, today);
    });


    // ---------------------------------------------------
    // 6. REMOVE OVERLAPPING AVAILABILITY FROM TUTOR
    // ---------------------------------------------------
    newSessionDates.forEach(slot => {
      const dateKey = slot.date.toISOString().split("T")[0];

      if (!tutor.availability.has(dateKey)) return;

      const sessStart = parseTime(slot.start);
      const sessEnd = parseTime(slot.end);

      const dayAvail = tutor.availability.get(dateKey);

      const filtered = dayAvail.filter(a => {
        const avStart = parseTime(a.start);
        const avEnd = parseTime(a.end);

        // true → keep, false → remove
        const overlap = (sessStart < avEnd && sessEnd > avStart);
        return !overlap;
      });

      if (filtered.length === 0) tutor.availability.delete(dateKey);
      else tutor.availability.set(dateKey, filtered);
    });


    // --------------------------
    // 7. Save updated tutor
    // --------------------------
    await tutor.save();

    // 🛑 UPDATE REGISTRATION STATUS IF THIS CAME FROM A MATCH REQUEST
    let registration;
    if (registrationId) {
      // ... (update registration logic) ...
      const Registration = mongoose.model('Registration');
      registration = await Registration.findById(registrationId);
      if (registration) {
        registration.status = "Matched";
        registration.matchedSessionId = newSession._id;
        await registration.save();
      }
    }

    // --------------------------
    // 🛑 STEP 8: NOTIFY STUDENT OF MATCH SUCCESS
    // --------------------------
    if (registrationId && registration) {
      const tutorUser = await User.findById(tutor.userId); // Fetch User document linked to tutor

      await Notification.create({
        // Send to the student's User ID
        user: studentIdToEnroll,
        studentId: studentIdToEnroll, // Add studentId for display in notification details
        title: "Match Confirmed!",
        message: `Your tutor ${tutor.name} has confirmed your session for ${subject}.`,
        type: "MATCH_SUCCESS",
        relatedSession: newSession._id,
        metadata: {
          tutorName: tutor.name,
          subject: subject,
          date: newSessionDates[0].date.toISOString().split("T")[0],
          startTime: newSessionDates[0].start,
          endTime: newSessionDates[0].end
        }
      });

      // Optional: Mark the original notification as read if you kept that logic
      // E.g., if you pass notificationId, you can mark it read here too.
    }

    // --------------------------
    // 9. Response
    // --------------------------
    return res.status(201).json({
      success: true,
      session: newSession
    });


  } catch (error) {
    console.error("Create session error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getSessionsByTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const sessions = await Session.find({ tutor: tutorId })
      .populate('students', 'name email')
      .sort({ startDate: 1 });

    // Return in consistent format with 'data' field
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error("Get sessions by tutor error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const flattenSchedule = (schedule) => {
  const result = [];

  for (const [dateKey, slots] of schedule.entries()) {
    const baseDate = new Date(dateKey);
    slots.forEach(s => {
      result.push({
        date: baseDate,
        start: s.start,
        end: s.end
      });
    });
  }
  return result;
};

export const checkTutorLocationConflict = async (tutorId, newSlots, newLocation, excludeSessionId = null) => {
  // Get all sessions of tutor
  const sessions = await Session.find({
    tutor: tutorId,
    _id: { $ne: excludeSessionId }
  });

  for (const sess of sessions) {
    for (const [dateKey, slots] of sess.schedule.entries()) {

      slots.forEach(existing => {
        const eStart = parseTime(existing.start);
        const eEnd = parseTime(existing.end);

        // Compare to new schedule
        newSlots.forEach(newSlot => {
          const sDateKey = newSlot.date.toISOString().split("T")[0];

          if (sDateKey !== dateKey) return;

          const nStart = parseTime(newSlot.start);
          const nEnd = parseTime(newSlot.end);

          const overlap = (nStart < eEnd && nEnd > eStart);

          if (overlap && sess.location !== newLocation) {
            // ❌ Same time, same day, DIFF location
            throw new Error(
              `Tutor cannot be in two locations at the same time on ${dateKey}: ` +
              `${existing.start}-${existing.end} at ${sess.location} and ` +
              `${newSlot.start}-${newSlot.end} at ${newLocation}`
            );
          }
        });
      });
    }
  }

  return false;
};


export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const studentCount = session.students.length;

    if (studentCount > 0) {
      // --- RESTRICTED EDIT (Students Enrolled) ---
      // Rule: Only capacity, location, description allow.
      const allowedFields = ['capacity', 'description', 'location'];
      const keys = Object.keys(updates);
      const hasIllegalField = keys.some(key => !allowedFields.includes(key));

      //if (hasIllegalField) {
      //  return res.status(403).json({
      //    message: "Students are enrolled. You can only edit Capacity, Description, or Location."
      //  });
      //}

      // Check Location Conflict Only
      if (updates.location && updates.location !== session.location) {
        const newSlots = flattenSchedule(session.schedule);

        const hasConflict = await checkTutorLocationConflict(
          session.tutor,
          newSlots,
          updates.location,
          sessionId
        );
        if (hasConflict) return res.status(400).json({ message: "New location conflicts with another session." });

        session.location = updates.location;
      }

      if (updates.capacity) {
        if (updates.capacity < studentCount) return res.status(400).json({ message: "Capacity cannot be less than current student count." });
        session.capacity = updates.capacity;
      }

      if (updates.description) session.description = updates.description;

      await session.save();
      return res.status(200).json({ success: true, session });

    } else {
      // --- FULL EDIT (No Students) ---
      // For a full implementation, you would need to:
      // 1. Remove old bookedSlots from Tutor.
      // 2. Restore old Availability (optional/complex).
      // 3. Validate new time conflicts.
      // 4. Add new bookedSlots.
      // 5. Remove new Availability.

      // For this snippet, assuming basic updates + location check
      if (updates.location || updates.timeTable || updates.startDate) {
        const newLoc = updates.location || session.location;
        const newTable = updates.timeTable || session.timeTable;
        const newStart = updates.startDate || session.startDate;
        const newDur = updates.duration || session.duration;

        const newSlots = flattenSchedule(session.schedule);
        const locConflict = await checkTutorLocationConflict(session.tutor, newSlots, newLoc, sessionId);

        if (locConflict) return res.status(400).json({ message: "Location/Time conflict." });
      }

      Object.assign(session, updates);
      await session.save();
      return res.status(200).json({ success: true, session });
    }

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------
// 4. DELETE SESSION
// ---------------------------------------------------
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Rule: Only allow delete if no students enrolled
    if (session.students.length > 0) {
      return res.status(403).json({ message: "Cannot delete session with enrolled students." });
    }

    const tutorId = session.tutor;

    // Delete session
    await Session.findByIdAndDelete(sessionId);

    // Remove booked slots from Tutor
    const tutor = await Tutor.findById(tutorId);

    for (const [dateKey, slots] of tutor.bookedSlots.entries()) {
      const filtered = slots.filter(s => s.sessionId.toString() !== sessionId);

      if (filtered.length === 0) tutor.bookedSlots.delete(dateKey);
      else tutor.bookedSlots.set(dateKey, filtered);
    }

    await tutor.save();

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

};

// Get session details by ID
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate('tutor', 'name email')
      .populate('students', 'name email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({ message: error.message });
  }
};
// Add material to session
export const addMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content, description } = req.body;
    const userId = req.user.id; // From auth middleware

    const session = await Session.findById(id).populate({
      path: 'tutor',
      select: 'userId'
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is the tutor
    // if (!session.tutor.userId) {
    //  return res.status(403).json({ message: 'Only the session tutor can add materials' });
    //}
    const newMaterial = {
      title,
      type,
      content,
      description,
      addedBy: userId,
      createdAt: new Date()
    };

    session.materials.push(newMaterial);
    await session.save();

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Add material error:', error);
    return res.status(500).json({ message: error.message });
  }
};
// Delete material from session
export const deleteMaterial = async (req, res) => {
  try {
    const { id, materialId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id).populate('tutor');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is the tutor
    //if (!session.tutor.userId) {
    //  return res.status(403).json({ message: 'Only the session tutor can delete materials' });
    //}

    session.materials = session.materials.filter(
      m => m._id.toString() !== materialId
    );

    await session.save();

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Delete material error:', error);
    return res.status(500).json({ message: error.message });
  }
};