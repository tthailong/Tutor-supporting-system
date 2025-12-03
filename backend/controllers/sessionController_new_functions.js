// ---------------------------------------------------
// GET TUTOR'S AVAILABLE SESSIONS (for student self-enrollment)
// ---------------------------------------------------
export const getTutorAvailableSessions = async (req, res) => {
    try {
        const { tutorId } = req.params;

        const now = new Date();

        // Find sessions that:
        // - Belong to this tutor
        // - Haven't started yet or are in progress
        // - Have available capacity
        const sessions = await Session.find({
            tutor: tutorId,
            startDate: { $gte: now },
            status: { $in: ['Scheduled', 'Rescheduled'] }
        })
            .populate('students', 'name email')
            .populate('tutor', 'name')
            .sort({ startDate: 1 });

        // Filter sessions with available capacity
        const availableSessions = sessions.filter(session =>
            session.students.length < session.capacity
        );

        // Format response
        const formattedSessions = availableSessions.map(session => ({
            _id: session._id,
            subject: session.subject,
            location: session.location,
            schedule: session.schedule,
            startDate: session.startDate,
            duration: session.duration,
            capacity: session.capacity,
            enrolledCount: session.students.length,
            availableSpots: session.capacity - session.students.length,
            description: session.description,
            tutor: session.tutor
        }));

        res.status(200).json({
            success: true,
            sessions: formattedSessions
        });
    } catch (error) {
        console.error("Get available sessions error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------
// JOIN SESSION (student self-enrollment)
// ---------------------------------------------------
export const joinSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { studentId } = req.body; // User ID from request

        // Find session
        const session = await Session.findById(sessionId).populate('tutor', 'name userId');
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Check capacity
        if (session.students.length >= session.capacity) {
            return res.status(400).json({ success: false, message: "Session is full" });
        }

        // Find student profile
        const studentProfile = await Student.findOne({ userId: studentId });
        if (!studentProfile) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        // Check if already enrolled
        if (session.students.some(s => s.toString() === studentProfile._id.toString())) {
            return res.status(400).json({ success: false, message: "Already enrolled in this session" });
        }

        // Add student to session
        session.students.push(studentProfile._id);
        await session.save();

        // No notification sent to tutor per requirements

        res.status(200).json({
            success: true,
            message: "Successfully joined session",
            session
        });
    } catch (error) {
        console.error("Join session error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
