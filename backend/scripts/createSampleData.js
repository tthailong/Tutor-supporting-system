import mongoose from "mongoose";
import dotenv from "dotenv";
import subjectModel from "../models/subjectModel.js";
import tutorModel from "../models/tutorModel.js";
import User from "../models/User.js";
import registrationModel from "../models/registrationModel.js";

dotenv.config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected\n");

    // --------------------
    // 1. CLEAR OLD DATA
    // --------------------
    console.log("🧹 Clearing old data...");
    await subjectModel.deleteMany({});
    await tutorModel.deleteMany({});
    await registrationModel.deleteMany({});
    console.log("✅ Old data cleared\n");

    // --------------------
    // 2. CREATE SUBJECTS
    // --------------------
    console.log("📚 Creating subjects...");
    
    const subjects = await subjectModel.insertMany([
      { code: "CHEM101", name: "General Chemistry", department: "Chemistry", isActive: true },
      { code: "PHYS101", name: "Physics 1", department: "Physics", isActive: true },
      { code: "MATH101", name: "Calculus A1", department: "Mathematics", isActive: true },
      { code: "BIO101", name: "General Biology", department: "Biology", isActive: true },
      { code: "CS101", name: "Introduction to Programming", department: "Computer Science", isActive: true },
      { code: "MECH101", name: "Mechanics", department: "Physics", isActive: true }
    ]);
    
    console.log(`✅ Created ${subjects.length} subjects\n`);

    // --------------------
    // 3. CREATE ALL TUTORS (MERGED)
    // --------------------
    console.log("👨‍🏫 Creating tutors...");
    
    const allTutors = [
      // Basic tutors (from createSampleTutors.js)
      {
        name: "Đặng Bảo Trọng",
        phone: "0123456789",
        expertise: ["General Chemistry"],
        description: "Tutor General Chemistry",
        bio: "Experienced chemistry tutor with practical approach",
        rating: 4.5,
        totalSessions: 15,
        activeStudents: 2,
        availability: {},
        bookedSlots: {}
      },
      {
        name: "Nguyễn Văn A",
        phone: "0987654321",
        expertise: ["Physics 1", "Mechanics"],
        description: "Physics specialist",
        bio: "Passionate about physics education",
        rating: 4.3,
        totalSessions: 12,
        activeStudents: 1,
        availability: {},
        bookedSlots: {}
      },
      {
        name: "Trần Thị B",
        phone: "0912345678",
        expertise: ["Calculus A1"],
        description: "Math tutor",
        bio: "Experienced tutor specializing in Calculus A1",
        rating: 4.7,
        totalSessions: 18,
        activeStudents: 3,
        availability: {},
        bookedSlots: {}
      },
      
      // Advanced tutors (from createSampleMatchingData.js)
      {
        name: "Dr. Sarah Johnson",
        phone: "0901234567",
        expertise: ["Physics 1", "Mechanics"],
        description: "PhD in Physics with 10 years teaching experience",
        bio: "Passionate about making physics accessible and fun",
        rating: 4.8,
        totalSessions: 45,
        activeStudents: 3,
        availability: {
          "2025-11-28": [{ start: "09:00", end: "11:00" }, { start: "14:00", end: "16:00" }],
          "2025-11-29": [{ start: "10:00", end: "12:00" }]
        },
        bookedSlots: {}
      },
      {
        name: "Prof. Michael Chen",
        phone: "0902345678",
        expertise: ["Calculus A1", "Introduction to Programming"],
        description: "Mathematics and CS professor",
        bio: "Helping students master calculus and coding for 15 years",
        rating: 4.9,
        totalSessions: 67,
        activeStudents: 2,
        availability: {
          "2025-11-27": [{ start: "08:00", end: "10:00" }],
          "2025-11-28": [{ start: "13:00", end: "15:00" }]
        },
        bookedSlots: {}
      },
      {
        name: "Ms. Emily Rodriguez",
        phone: "0903456789",
        expertise: ["General Biology"],
        description: "Biology specialist with research background",
        bio: "Making biology engaging through real-world examples",
        rating: 4.6,
        totalSessions: 32,
        activeStudents: 6,
        availability: {
          "2025-11-28": [{ start: "09:00", end: "11:00" }],
          "2025-11-30": [{ start: "14:00", end: "16:00" }]
        },
        bookedSlots: {}
      },
      {
        name: "Mr. David Kim",
        phone: "0904567890",
        expertise: ["Introduction to Programming", "General Chemistry"],
        description: "Software engineer turned educator",
        bio: "Bridging the gap between theory and practice",
        rating: 4.7,
        totalSessions: 28,
        activeStudents: 4,
        availability: {
          "2025-11-27": [{ start: "15:00", end: "17:00" }],
          "2025-11-29": [{ start: "09:00", end: "11:00" }]
        },
        bookedSlots: {}
      }
    ];

    const tutors = await tutorModel.insertMany(allTutors);
    console.log(`✅ Created ${tutors.length} tutors\n`);

    // --------------------
    // 4. CHECK FOR SAMPLE STUDENT
    // --------------------
    console.log("👨‍🎓 Checking for sample students...");
    
    let sampleStudent = await User.findOne({ role: "Student" });
    
    if (!sampleStudent) {
      sampleStudent = await User.create({
        email: "student@example.com",
        passwordHash: "$2b$10$samplehash",
        role: "Student",
        fullname: "John Doe",
        phoneNumber: "0987654321",
        status: true
      });
      console.log("✅ Created sample student\n");
    } else {
      console.log("✅ Sample student already exists\n");
    }

    // --------------------
    // 5. CREATE SAMPLE REGISTRATIONS
    // --------------------
    console.log("📝 Creating sample registrations...");
    
    const sampleRegistrations = [
      {
        studentId: sampleStudent._id,
        tutorId: tutors[3]._id, // Dr. Sarah Johnson
        subject: "Physics 1",
        description: "Need help with kinematics and dynamics",
        preferredTimeSlots: [
          { dayOfWeek: "Mon", startTime: "09:00", endTime: "11:00" }
        ],
        status: "Pending",
        type: "Manual",
        matchScore: 0
      },
      {
        studentId: sampleStudent._id,
        tutorId: tutors[4]._id, // Prof. Michael Chen
        subject: "Calculus A1",
        description: "Struggling with derivatives and integrals",
        preferredTimeSlots: [
          { dayOfWeek: "Wed", startTime: "13:00", endTime: "15:00" }
        ],
        status: "Matched",
        type: "Auto",
        matchScore: 17
      },
      {
        studentId: sampleStudent._id,
        tutorId: null,
        subject: "Advanced Quantum Mechanics",
        description: "Looking for expert tutor",
        preferredTimeSlots: [
          { dayOfWeek: "Fri", startTime: "14:00", endTime: "16:00" }
        ],
        status: "Coordinator_Review",
        type: "Auto",
        matchScore: 5
      },
      {
        studentId: sampleStudent._id,
        tutorId: tutors[5]._id, // Ms. Emily Rodriguez
        subject: "General Biology",
        description: "Preparing for midterm exam",
        preferredTimeSlots: [
          { dayOfWeek: "Thu", startTime: "14:00", endTime: "16:00" }
        ],
        status: "Matched",
        type: "Auto",
        matchScore: 15
      }
    ];

    const registrations = await registrationModel.insertMany(sampleRegistrations);
    console.log(`✅ Created ${registrations.length} sample registrations\n`);

    // --------------------
    // SUMMARY
    // --------------------
    console.log("=".repeat(50));
    console.log("✅ SAMPLE DATA CREATION COMPLETE!");
    console.log("=".repeat(50));
    console.log(`📚 Subjects: ${subjects.length}`);
    console.log(`👨‍🏫 Tutors: ${tutors.length}`);
    console.log(`👨‍🎓 Sample Student: ${sampleStudent.email}`);
    console.log(`📝 Registrations: ${registrations.length}`);
    console.log("=".repeat(50));
    console.log("\n🎯 You can now test the matching API endpoints!");
    console.log(`\nSample Student ID: ${sampleStudent._id}`);
    console.log("\nSample Tutor IDs:");
    tutors.forEach((tutor, i) => {
      console.log(`  ${i + 1}. ${tutor.name}: ${tutor._id}`);
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

createSampleData();
