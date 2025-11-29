import mongoose from "mongoose";
import dotenv from "dotenv";
import sessionModel from "./models/sessionModel.js";
import tutorModel from "./models/tutorModel.js";
import User from "./models/User.js";
import studentModel from "./models/studentModel.js"; 

dotenv.config();

/**
 * Calculates a future date string (YYYY-MM-DD).
 * @param {number} days The number of days from now.
 * @returns {string} The future date string (e.g., "2025-12-05").
 */
const getFutureDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  // Returns date as YYYY-MM-DD string
  return d.toISOString().split("T")[0]; 
};

/**
 * Converts a Date object to a YYYY-MM-DD string.
 * @param {Date} date - The date object.
 * @returns {string} The date string.
 */
const formatDateKey = (date) => {
    // Note: Use toISOString() and slice to avoid timezone issues when converting to YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

const createSampleSessions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    await sessionModel.deleteMany({});
    console.log("🧹 Old sessions cleared.");
    
    // --- 1. Fetch Tutors and Students ---
    const tutors = await tutorModel.find();
    const students = await User.find({ role: "Student" }).populate("studentProfile");

    // Filter and map student profile IDs for enrollment
    const studentIds = students
      .filter(s => s.studentProfile) 
      .map(s => s.studentProfile._id)
      .slice(0, 3);
    
    // Get the actual student documents for later update
    const enrolledStudentProfiles = students
      .filter(s => s.studentProfile)
      .slice(0, 3)
      .map(s => s.studentProfile);


    if (tutors.length < 2) throw new Error("❌ Need at least two tutors to run the sample script.");
    if (studentIds.length === 0) console.warn("⚠️ No student profiles found to enroll in sessions.");

    // --- 2. Prepare Schedules ---
    const date1 = getFutureDate(1); // e.g., Day 1
    const date2 = getFutureDate(2); // e.g., Day 2
    const date3a = getFutureDate(3); // e.g., Day 3 (for session 3, week 1)
    const date3b = getFutureDate(5); // e.g., Day 5 (for session 3, week 1)

    // Schedule 1: 1 week duration
    const schedule1 = new Map([[date1, [{ start: "08:00", end: "10:00" }]]]);

    // Schedule 2: 1 week duration
    const schedule2 = new Map([[date2, [{ start: "13:00", end: "15:00" }]]]);

    // Schedule 3: 2 weeks duration, runs on two different days (date3a, date3b)
    const schedule3 = new Map([
      [date3a, [{ start: "09:00", end: "11:00" }]],
      [date3b, [{ start: "09:00", end: "11:00" }]]
    ]);
    
    // Students to enroll
    const enrolledStudents1 = studentIds; 
    const enrolledStudents3 = studentIds.slice(0, 1); 

    // --- 3. Sample Session Data ---
    const sample = [
      {
        subject: "General Chemistry",
        tutor: tutors[0]._id,
        location: "H6-202",
        schedule: schedule1,
        startDate: new Date(date1),
        duration: 1, // 1 week
        capacity: 30,
        description: "Atoms & structure",
        students: enrolledStudents1,
        evaluations: [],
        studentProgress: []
      },
      {
        subject: "Physics 1 (Empty)",
        tutor: tutors[1]._id,
        location: "H1-101",
        schedule: schedule2,
        startDate: new Date(date2),
        duration: 1, // 1 week
        capacity: 25,
        description: "Newton's laws",
        students: [],
        evaluations: [],
        studentProgress: []
      },
      {
        subject: "Calculus - Integration (Multi-Week)",
        tutor: tutors[0]._id,
        location: "B4-304",
        schedule: schedule3,
        startDate: new Date(date3a),
        duration: 2, // 2 weeks
        capacity: 10,
        description: "Integration techniques",
        students: enrolledStudents3,
        evaluations: [],
        studentProgress: []
      }
    ];

    // --- 4. Create Sessions and Update Tutors/Students ---
    for (const s of sample) {
      const session = new sessionModel(s);
      await session.save();
      console.log(`\n📘 Created Session: ${session.subject} (${session._id})`);

      // Find the associated tutor
      const tutor = await tutorModel.findById(session.tutor);
      if (!tutor) {
          console.error(`❌ Tutor not found for session ${session._id}`);
          continue;
      }
      
      // Ensure bookedSlots Map is initialized
      if (!tutor.bookedSlots) {
        tutor.bookedSlots = new Map();
      }

      // --- Update Tutor bookedSlots using the session method ---
      // This method (defined in sessionModel.js) calculates all dates across the duration
      const allBookings = session.getSessionDates();
      
      for (const booking of allBookings) {
          const dateKey = formatDateKey(booking.date);
          
          // Ensure the date key exists in the Map
          if (!tutor.bookedSlots.has(dateKey)) {
              tutor.bookedSlots.set(dateKey, []);
          }

          // Add the booked slot with sessionId reference
          tutor.bookedSlots.get(dateKey).push({
              start: booking.start,
              end: booking.end,
              sessionId: session._id
          });
      }

      await tutor.save();
      console.log(`📅 Updated Tutor bookedSlots for ${tutor.name} with ${allBookings.length} total slots.`);

      // --- Update Enrolled Student Profiles ---
      if (session.students && session.students.length > 0) {
        const studentPromises = enrolledStudentProfiles
            .filter(student => session.students.includes(student._id))
            .map(async (studentProfile) => {
                // Ensure sessions array exists and push the new session ID
                if (!studentProfile.sessions) studentProfile.sessions = [];
                
                // Only push if not already present
                if (!studentProfile.sessions.map(String).includes(String(session._id))) {
                    studentProfile.sessions.push(session._id);
                    await studentProfile.save();
                    // console.log(`👤 Updated Student ${studentProfile.name} with session.`); // Can be verbose
                }
            });
        
        await Promise.all(studentPromises);
        console.log(`👥 Updated ${session.students.length} student profiles.`);
      }
    }

    console.log("\n🎉 All sessions created and tutors/students updated successfully!");
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    mongoose.connection.close();
    console.log("👋 DB Connection closed.");
  }
};

createSampleSessions();