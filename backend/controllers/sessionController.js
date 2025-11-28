import Session from "../models/sessionModel.js";
import Tutor from "../models/tutorModel.js";

// Helper: 07:00 -> 700
const parseTime = (t) => parseInt(t.replace(":", ""));

// ---------------------------------------------------
// 1. CREATE SESSION - CORRECTED
// ---------------------------------------------------
// ---------------------------------------------------
// CREATE SESSION  (FULLY REWRITTEN & CORRECT)
// ---------------------------------------------------
export const createSession = async (req, res) => {
  try {
    const { tutorId, subject, location, schedule, duration, capacity, description } = req.body;

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
      description
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


    // --------------------------
    // 8. Response
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
      .populate('students', 'name email') // Optional: populate basic student info
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

      if (hasIllegalField) {
        return res.status(403).json({
          message: "Students are enrolled. You can only edit Capacity, Description, or Location."
        });
      }

      // Check Location Conflict Only
      if (updates.location && updates.location !== session.location) {
        const hasConflict = await Session.checkLocationConflict(
          updates.location,
          session.timeTable,
          session.startDate,
          session.duration,
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

        const locConflict = await Session.checkLocationConflict(newLoc, newTable, newStart, newDur, sessionId);
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

    await Session.findByIdAndDelete(sessionId);

    // Remove from Tutor BookedSlots
    await Tutor.findByIdAndUpdate(tutorId, {
      $pull: { bookedSlots: { sessionId: sessionId } }
    });

    return res.status(200).json({ message: "Session deleted successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};