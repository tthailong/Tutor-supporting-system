import mongoose from "mongoose";
import dotenv from "dotenv";
import sessionModel from "./models/sessionModel.js";
import tutorModel from "./models/tutorModel.js";
import User from "./models/User.js"; 
// Ensure these paths match your project structure

dotenv.config();

// ---------------------------------------------------
// HELPER: Get a date string (YYYY-MM-DD) for next Week
// ---------------------------------------------------
const getFutureDate = (daysToAdd) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // Returns "2025-11-30" format
};

const createSampleSessions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    // 1. 🧹 CLEANUP
    await sessionModel.deleteMany({});
    console.log("🧹 Deleted old sessions.");

    // 2. 🔍 FETCH DEPENDENCIES (Tutors & Students)
    const tutors = await tutorModel.find();
    const students = await User.find({ role: "student" }); // Adjust query if your role logic differs

    if (tutors.length === 0) {
      throw new Error("❌ No tutors found. Please run createSampleTutors.js first.");
    }
    
    // We need at least one student ID to enroll, or we can leave it empty
    const studentIds = students.map(s => s._id).slice(0, 3); // Take first 3 students

    // 3. 📅 PREPARE SCHEDULES (Using JS Maps)
    
    // Date 1: 2 days from now
    const date1 = getFutureDate(2);
    const schedule1 = new Map();
    schedule1.set(date1, [
      { start: "08:00", end: "10:00" }
    ]);

    // Date 2: 3 days from now (Different Subject)
    const date2 = getFutureDate(3);
    const schedule2 = new Map();
    schedule2.set(date2, [
      { start: "13:00", end: "15:00" }
    ]);

    // Date 3: Complex Schedule (2 days)
    const date3a = getFutureDate(4);
    const date3b = getFutureDate(6);
    const schedule3 = new Map();
    schedule3.set(date3a, [{ start: "09:00", end: "11:00" }]);
    schedule3.set(date3b, [{ start: "09:00", end: "11:00" }]);


    // 4. 🧪 SAMPLE DATA
    const sampleSessions = [
      {
        subject: "General Chemistry - Basics",
        tutor: tutors[0]._id,
        location: "H6-202",
        
        // The Map we created above
        schedule: schedule1,
        
        startDate: new Date(date1),
        duration: 1, 
        capacity: 30,
        description: "Introduction to atomic structure.",
        
        students: studentIds, // Enrolling existing students
        
        // Requested to be empty/null
        evaluations: [],
        studentProgress: [],
        
        status: "Scheduled"
      },
      {
        subject: "Physics 1 - Mechanics",
        tutor: tutors[1] ? tutors[1]._id : tutors[0]._id,
        location: "H1-101",
        
        schedule: schedule2,
        
        startDate: new Date(date2),
        duration: 1,
        capacity: 25,
        description: "Newton's laws and practical examples.",
        
        students: [], // No students enrolled yet
        evaluations: [],
        studentProgress: [],
        
        status: "Scheduled"
      },
      {
        subject: "Calculus - Integration",
        tutor: tutors[0]._id,
        location: "B4-304",
        
        schedule: schedule3, // Multi-day schedule
        
        startDate: new Date(date3a),
        duration: 2,
        capacity: 10,
        description: "Deep dive into integration techniques.",
        
        students: studentIds.slice(0, 1),
        evaluations: [],
        studentProgress: [],
        
        status: "Scheduled"
      }
    ];

    // 5. 📝 SAVE TO DB
    // We loop and save individually to ensure the 'pre-save' hook runs 
    // (to calculate endDate and check overlaps)
    for (const data of sampleSessions) {
      const session = new sessionModel(data);
      await session.save();
      console.log(`✅ Created Session: ${session.subject}`);
      
      // OPTIONAL: Update Tutor BookedSlots here if needed
      // (As per your previous logic, you might want to push these dates to the tutorModel)
    }

    console.log("\n🎉 All sample sessions created successfully!");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleSessions();