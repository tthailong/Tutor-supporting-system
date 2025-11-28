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

    const session = await Session.findById(sessionId).populate("tutor");
    if (!session) return res.status(404).json({ message: "Session not found" });

    const tutor = session.tutor;

    // thời khóa biểu ban đầu (schedule) nhưng chỉ lấy ngày đầu tiên
    const schedule = session.schedule;
    const originalDates = Array.from(schedule.keys());

    if (originalDates.length === 0) 
      return res.status(200).json({ success: true, availableSlots: [] });

    const originalDate = originalDates[0];

    const existingSlots = tutor.bookedSlots.get(originalDate) || [];
    const availableSlots = tutor.availability.get(originalDate) || [];

    const freeSlots = availableSlots.filter(av => {
      const avStart = Number(av.start.replace(":", ""));
      const avEnd = Number(av.end.replace(":", ""));

      for (const b of existingSlots) {
        const bStart = Number(b.start.replace(":", ""));
        const bEnd = Number(b.end.replace(":", ""));
        if (avStart < bEnd && avEnd > bStart) return false;
      }

      return true;
    });

    return res.status(200).json({ success: true, availableSlots: freeSlots });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rescheduleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { newStart, newEnd } = req.body;

    const session = await Session.findById(sessionId).populate("tutor");
    if (!session) return res.status(404).json({ message: "Session not found" });

    const tutor = session.tutor;

    // Lấy ngày
    const schedule = session.schedule;
    const dates = Array.from(schedule.keys());
    const dateKey = dates[0];

    // 1. Remove old bookedSlot
    const bookedSlots = tutor.bookedSlots.get(dateKey) || [];
    tutor.bookedSlots.set(
      dateKey,
      bookedSlots.filter(b => String(b.sessionId) !== String(sessionId))
    );

    // 2. Add new bookedSlot
    tutor.bookedSlots.get(dateKey).push({
      start: newStart,
      end: newEnd,
      sessionId: session._id
    });

    await tutor.save();

    // 3. Update session schedule
    session.schedule.set(dateKey, [{ start: newStart, end: newEnd }]);
    session.status = "Rescheduled";
    await session.save();

    return res.status(200).json({ success: true, session });

  } catch (err) {
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