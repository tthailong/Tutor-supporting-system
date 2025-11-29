import Session from "../models/sessionModel.js";
import Tutor from "../models/tutorModel.js";

export const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    const sessions = await Session.find({ students: studentId })
      .populate("tutor", "name")
      .sort({ startDate: 1 });

    return res.status(200).json({ success: true, sessions });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAvailableRescheduleSlots = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1. Find the session
    const session = await Session.findById(sessionId)
      .populate("tutor")
      .populate("students");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const tutor = session.tutor;
    const tutorId = tutor._id;

    const originalDate = Array.from(session.schedule.keys())[0];
    const originalSlot = session.schedule.get(originalDate)[0];

    // Convert helper
    const toNum = (t) => Number(t.replace(":", ""));

    // ---------------------------
    // (A) Available slots
    // ---------------------------

    const availability = [];

    for (const [date, slots] of tutor.availability.entries()) {
      const booked = tutor.bookedSlots.get(date) || [];

      slots.forEach(av => {
        let conflict = false;

        const avStart = toNum(av.start);
        const avEnd = toNum(av.end);

        booked.forEach(b => {
          const bStart = toNum(b.start);
          const bEnd = toNum(b.end);
          if (avStart < bEnd && avEnd > bStart) conflict = true;
        });

        if (!conflict) {
          availability.push({
            type: "availability",
            date,
            start: av.start,
            end: av.end
          });
        }
      });
    }

    // ---------------------------
    // (B) Tutor’s existing sessions
    // ---------------------------

    // Find all sessions of tutor except the one being rescheduled
    const otherSessions = await Session.find({
      tutor: tutorId,
      _id: { $ne: sessionId }
    })
      .populate("students", "name")
      .sort({ startDate: 1 });

    const joinableSessions = [];

    otherSessions.forEach(sess => {
      const date = Array.from(sess.schedule.keys())[0];
      const slot = sess.schedule.get(date)[0];

      const start = toNum(slot.start);
      const end = toNum(slot.end);

      const origStart = toNum(originalSlot.start);
      const origEnd = toNum(originalSlot.end);

      // Skip if capacity full
      if (sess.students.length >= sess.capacity) return;

      // Skip if same time slot as old session
      if (start === origStart && end === origEnd && date === originalDate) return;

      joinableSessions.push({
        type: "session",
        sessionId: sess._id,
        subject: sess.subject,
        tutor: tutor.name,
        date,
        start: slot.start,
        end: slot.end,
        capacity: sess.capacity,
        enrolled: sess.students.length
      });
    });

    return res.status(200).json({
      success: true,
      options: {
        availability,
        sessions: joinableSessions
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const rescheduleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, date, start, end, newSessionId } = req.body;

    const session = await Session.findById(sessionId).populate("tutor students");
    if (!session) return res.status(404).json({ message: "Session not found" });

    const tutor = session.tutor;
    const studentId = session.students[0]._id; // student hiện tại

    // Helper convert
    const toNum = (t) => Number(t.replace(":", ""));

    // ------------------------------
    // CASE A: RESCHEDULE TO AVAILABILITY
    // ------------------------------
    if (type === "availability") {
      const oldDate = Array.from(session.schedule.keys())[0];
      const oldSlot = session.schedule.get(oldDate)[0];

      // 1. Remove old bookedSlot
      const oldBooked = tutor.bookedSlots.get(oldDate) || [];
      tutor.bookedSlots.set(
        oldDate,
        oldBooked.filter(b => String(b.sessionId) !== String(sessionId))
      );

      // 2. Add new bookedSlot
      const bookedList = tutor.bookedSlots.get(date) || [];
      bookedList.push({ start, end, sessionId: session._id });
      tutor.bookedSlots.set(date, bookedList);

      // 3. Remove availability used
      const avList = tutor.availability.get(date) || [];
      tutor.availability.set(
        date,
        avList.filter(a => !(a.start === start && a.end === end))
      );

      // 4. Update session schedule
      session.schedule = new Map([[date, [{ start, end }]]]);
      session.status = "Rescheduled";

      await tutor.save();
      await session.save();

      return res.status(200).json({
        success: true,
        message: "Session rescheduled to availability slot",
        session
      });
    }

    // ------------------------------
    // CASE B: RESCHEDULE TO ANOTHER SESSION
    // ------------------------------

    if (type === "session") {
      const newSession = await Session.findById(newSessionId).populate("students");
      if (!newSession) return res.status(404).json({ message: "Target session not found" });

      // Check capacity
      if (newSession.students.length >= newSession.capacity) {
        return res.status(400).json({ message: "Target session full" });
      }

      // 1. Remove student from old session
      session.students = session.students.filter(
        s => String(s) !== String(studentId)
      );
      await session.save();

      // 2. Add student to new session
      newSession.students.push(studentId);
      await newSession.save();

      return res.status(200).json({
        success: true,
        message: "Student moved to new session",
        newSessionId
      });
    }

    return res.status(400).json({ message: "Invalid type" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const cancelStudentCourse = async (req, res) => {
  try {
    const { sessionId, studentId } = req.params;

    const session = await Session.findById(sessionId).populate("tutor");
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1. Remove student from session
    session.students = session.students.filter(
      s => String(s) !== String(studentId)
    );
    await session.save();

    // 2. Remove bookedSlot from tutor
    const schedule = session.schedule;
    const dateKeys = Array.from(schedule.keys());

    dateKeys.forEach(date => {
      const slots = session.schedule.get(date);

      const bookedList = session.tutor.bookedSlots.get(date) || [];
      const filtered = bookedList.filter(b => String(b.sessionId) !== sessionId);

      session.tutor.bookedSlots.set(date, filtered);
    });

    await session.tutor.save();

    return res.status(200).json({ success: true, message: "Course canceled" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};