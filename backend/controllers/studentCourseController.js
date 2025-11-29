import Session from "../models/sessionModel.js";
import Tutor from "../models/tutorModel.js";
import { sendNoti } from "../utils/sendNotification.js";

// ===================================================================
// 1. GET tất cả session mà student đã đăng ký
// ===================================================================
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

// ===================================================================
// 2. GET các lựa chọn reschedule (availability + sessions)
// ===================================================================
export const getAvailableRescheduleSlots = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
      .populate("tutor", "name availability bookedSlots")
      .populate("students", "name");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const tutor = session.tutor;
    const tutorId = tutor._id;

    const originalDate = Array.from(session.schedule.keys())[0];
    const originalSlot = session.schedule.get(originalDate)[0];

    const toNum = (t) => Number(t.replace(":", ""));

    // -------------------------
    // A. AVAILABILITY (free slots)
    // -------------------------
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

    // -------------------------
    // B. Other sessions (joinable)
    // -------------------------
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

      const startNum = toNum(slot.start);
      const endNum = toNum(slot.end);

      const origStart = toNum(originalSlot.start);
      const origEnd = toNum(originalSlot.end);

      if (sess.students.length >= sess.capacity) return; // full capacity
      if (startNum === origStart && endNum === origEnd && date === originalDate) return;

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

// ===================================================================
// 3. RESCHEDULE SESSION (A: availability / B: join another session)
// ===================================================================
export const rescheduleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, date, start, end, newSessionId } = req.body;

    const session = await Session.findById(sessionId)
      .populate("tutor", "name bookedSlots availability")
      .populate("students", "name email");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const tutor = session.tutor;
    const student = session.students[0];
    const studentId = student._id;

    // ===========================================================
    // CASE A: Reschedule theo availability
    // ===========================================================
    if (type === "availability") {

      const oldDate = Array.from(session.schedule.keys())[0];

      // 1. Remove bookedSlot cũ
      const oldBooked = tutor.bookedSlots.get(oldDate) || [];
      tutor.bookedSlots.set(
        oldDate,
        oldBooked.filter(b => String(b.sessionId) !== String(sessionId))
      );

      // 2. Add bookedSlot mới
      const bookedList = tutor.bookedSlots.get(date) || [];
      bookedList.push({ start, end, sessionId: session._id });
      tutor.bookedSlots.set(date, bookedList);

      // 3. Remove availability đã dùng
      const avList = tutor.availability.get(date) || [];
      tutor.availability.set(
        date,
        avList.filter(a => !(a.start === start && a.end === end))
      );

      // 4. Update schedule
      session.schedule = new Map([[date, [{ start, end }]]]);
      session.status = "Rescheduled";

      await tutor.save();
      await session.save();

      // 🔔 Notification
      await sendNoti(
        tutor._id,
        "Student Rescheduled a Session",
        `${student.name} rescheduled their session to ${date} ${start}-${end}.`
      );

      await sendNoti(
        student._id,
        "Session Rescheduled Successfully",
        `Your session with ${tutor.name} is moved to ${date} ${start}-${end}.`
      );

      return res.status(200).json({
        success: true,
        message: "Session rescheduled to availability slot",
        session
      });
    }

    // ===========================================================
    // CASE B: Move student to another session
    // ===========================================================
    if (type === "session") {

      const newSession = await Session.findById(newSessionId)
        .populate("students", "name")
        .populate("tutor", "name bookedSlots availability");

      if (!newSession)
        return res.status(404).json({ message: "Target session not found" });

      if (newSession.students.length >= newSession.capacity)
        return res.status(400).json({ message: "Target session full" });

      // 1. Remove student from old session
      session.students = session.students.filter(s => String(s._id) !== String(studentId));
      await session.save();

      // 2. Remove old bookedSlot
      const oldDate = Array.from(session.schedule.keys())[0];
      const oldBooked = tutor.bookedSlots.get(oldDate) || [];
      tutor.bookedSlots.set(
        oldDate,
        oldBooked.filter(b => String(b.sessionId) !== String(sessionId))
      );
      await tutor.save();

      // 3. Add student to new session
      newSession.students.push(studentId);
      await newSession.save();

      // 🔔 Notification
      await sendNoti(
        newSession.tutor._id,
        "A Student Joined Your Session",
        `${student.name} joined your session: ${newSession.subject}.`
      );

      await sendNoti(
        tutor._id,
        "Student Left Your Session",
        `${student.name} left your session: ${session.subject}.`
      );

      const newDate = Array.from(newSession.schedule.keys())[0];

      await sendNoti(
        student._id,
        "Session Rescheduled",
        `You have been moved to session "${newSession.subject}" on ${newDate}.`
      );

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

// ===================================================================
// 4. CANCEL SESSION
// ===================================================================
export const cancelStudentCourse = async (req, res) => {
  try {
      const { sessionId, studentId } = req.params;

    const session = await Session.findById(sessionId)
      .populate("tutor", "name bookedSlots availability")
      .populate("students", "name");

    if (!session) return res.status(404).json({ message: "Session not found" });

    const student = session.students.find(s => String(s._id) === String(studentId));
    if (!student)
      return res.status(400).json({ message: "Student not in session" });

    // 1. Remove student from session
    session.students = session.students.filter(
      s => String(s._id) !== String(studentId)
    );
    await session.save();

    // 2. Remove booked slot
    const dates = Array.from(session.schedule.keys());
    dates.forEach(date => {
      const booked = session.tutor.bookedSlots.get(date) || [];
      session.tutor.bookedSlots.set(
        date,
        booked.filter(b => String(b.sessionId) !== String(sessionId))
      );
    });
    await session.tutor.save();

    // 🔔 Notification
    await sendNoti(
      session.tutor._id,
      "Student Cancelled Session",
      `${student.name} cancelled the session: ${session.subject}.`
    );

    await sendNoti(
      student._id,
      "Session Cancelled",
      `You have cancelled your session with tutor ${session.tutor.name}.`
    );

    return res.status(200).json({ success: true, message: "Course canceled" });

  } catch (err) {
      console.error("Error during cancelStudentCourse:", err);
      return res.status(500).json({ message: err.message });
  }
};