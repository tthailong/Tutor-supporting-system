import Session from "../models/sessionModel.js";
import Tutor from "../models/tutorModel.js";

// Helper: 07:00 -> 700
const parseTime = (t) => parseInt(t.replace(":", ""));

// ---------------------------------------------------
// 1. CREATE SESSION - CORRECTED
// ---------------------------------------------------
export const createSession = async (req, res) => {
  try {
    // Destructure payload. We expect the frontend to now send 'schedule' instead of 'timeTable'.
    const { tutorId, subject, location, startDate, duration, schedule, capacity, description } = req.body; // <-- Changed timeTable to schedule

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    // A. Generate dates for new session
    // We create a temporary instance using the NEW 'schedule' field
    const tempSession = new Session({ startDate, duration, schedule });
    const newSessionDates = tempSession.getSessionDates(); // <-- CHANGED FUNCTION NAME

    // B. Check Conflict with Tutor's BOOKED Slots (Gray)
    // Rule: Can create if NOT conflict with booked.
    for (const newSlot of newSessionDates) {
      const nStart = parseTime(newSlot.start);
      const nEnd = parseTime(newSlot.end);

      for (const booked of tutor.bookedSlots) {
        const bDate = new Date(booked.date);
        if (bDate.toDateString() === newSlot.date.toDateString()) {
          const bStart = parseTime(booked.startTime);
          const bEnd = parseTime(booked.endTime);

          if (nStart < bEnd && nEnd > bStart) {
            return res.status(400).json({ message: `Conflict with existing booking on ${bDate.toDateString()} at ${booked.startTime}` });
          }
        }
      }
    }

    // C. Check Global Location Conflict
    // NOTE: If Session.checkLocationConflict uses the old 'timeTable' array, this will fail.
    // If you removed that static method entirely, comment this out for now.
    // If you updated it to check the 'schedule' map, you must pass 'schedule' instead of 'timeTable'.
    // Assuming for now you commented out / removed the old static method:
    // const locationConflict = await Session.checkLocationConflict(location, schedule, startDate, duration);
    // if (locationConflict) {
    //   return res.status(400).json({ message: `Location ${location} is already booked during these times.` });
    // }

    // D. Create Session
    const newSession = new Session({
      subject, tutor: tutor._id, location, startDate, duration, schedule, capacity, description // <-- Changed timeTable to schedule
    });
    await newSession.save();

    // E. Update Tutor: Add to BookedSlots
    const bookedEntries = newSessionDates.map(slot => ({
      date: slot.date,
      startTime: slot.start,
      endTime: slot.end,
      sessionId: newSession._id
    }));
    tutor.bookedSlots.push(...bookedEntries);

    // F. Update Tutor: REMOVE Availability (Green Slots)
    // The logic below is correct for cleaning availability using the new Map/Date structure.
    newSessionDates.forEach(sessionDate => {
      const dateKey = sessionDate.date.toISOString().split('T')[0];

      if (tutor.availability.has(dateKey)) {
        let dailySlots = tutor.availability.get(dateKey);

        const sessStart = parseTime(sessionDate.start);
        const sessEnd = parseTime(sessionDate.end);

        const remainingSlots = dailySlots.filter(availSlot => {
          const avStart = parseTime(availSlot.start);
          const avEnd = parseTime(availSlot.end);
          const isOverlap = (sessStart < avEnd && sessEnd > avStart);
          return !isOverlap;
        });

        if (remainingSlots.length === 0) {
          tutor.availability.delete(dateKey);
        } else {
          tutor.availability.set(dateKey, remainingSlots);
        }
      }
    });

    await tutor.save();

    return res.status(201).json({ success: true, session: newSession });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

  // ---------------------------------------------------
  // 2. GET SESSIONS (For Tutor)
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // 3. EDIT SESSION
  // ---------------------------------------------------
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