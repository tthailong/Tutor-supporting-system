import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Tutor from "./models/tutorModel.js";
import Student from "./models/studentModel.js";

dotenv.config();

const createSampleUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected\n");

    // CLEAN OLD DATA
    await User.deleteMany({});
    await Tutor.deleteMany({});
    await Student.deleteMany({});
    console.log("🧹 Cleared old users, tutors, students.\n");

    const hashed = await bcrypt.hash("123456", 10);

    // -----------------------------
    // 1) CREATE TUTORS
    // -----------------------------
    const tutorData = [
      {
        email: "tutor001@hcmut.edu.vn",
        fullname: "Đặng Bảo Trọng",
        phone: "0123456789",
        expertise: ["General Chemistry"],
        description: "General Chemistry Tutor"
      },
      {
        email: "tutor002@hcmut.edu.vn",
        fullname: "Nguyễn Văn A",
        phone: "0987654321",
        expertise: ["Physics 1", "Mechanics"],
        description: "Physics Specialist"
      },
      {
        email: "tutor003@hcmut.edu.vn",
        fullname: "Trần Thị B",
        phone: "0912345678",
        expertise: ["Calculus A1"],
        description: "Math Tutor"
      }
    ];

    const tutorUsers = [];

    for (const t of tutorData) {
      const user = await User.create({
        email: t.email,
        passwordHash: hashed,
        role: "Tutor",
        fullname: t.fullname,
        phoneNumber: t.phone,
        status: true
      });

      const tutorProfile = await Tutor.create({
        userId: user._id,
        name: t.fullname,
        phone: t.phone,
        expertise: t.expertise,
        description: t.description,
        availability: {},
        bookedSlots: {}
      });

      user.tutorProfile = tutorProfile._id;
      await user.save();

      tutorUsers.push(user);
      console.log(`✅ Created Tutor: ${t.fullname}`);
    }

    // -----------------------------
    // 2) CREATE STUDENTS
    // -----------------------------
    const studentData = [
      {
        email: "student001@hcmut.edu.vn",
        fullname: "Student One",
        phone: "0901000001",
        hcmutID: "2110001"
      },
      {
        email: "student002@hcmut.edu.vn",
        fullname: "Student Two",
        phone: "0901000002",
        hcmutID: "2110002"
      },
      {
        email: "student003@hcmut.edu.vn",
        fullname: "Student Three",
        phone: "0901000003",
        hcmutID: "2110003"
      }
    ];

    const studentUsers = [];

    for (const s of studentData) {
      const user = await User.create({
        email: s.email,
        passwordHash: hashed,
        role: "Student",
        fullname: s.fullname,
        phoneNumber: s.phone,
        hcmutID: s.hcmutID
      });

      const studentProfile = await Student.create({
        userId: user._id,
        name: s.fullname,
        phone: s.phone,
        hcmutID: s.hcmutID,
        description: ""
      });

      user.studentProfile = studentProfile._id;
      await user.save();

      studentUsers.push(user);
      console.log(`🎓 Created Student: ${s.fullname}`);
    }

    console.log("\n🎉 Perfect! All tutors and students created.");

    return { tutorUsers, studentUsers };

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleUsers();
