import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Tutor from "./models/tutorModel.js";

dotenv.config();

const createSampleTutorsLinked = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected\n");

    // Clean old data
    await User.deleteMany({ role: "Tutor" });
    await Tutor.deleteMany({});
    console.log("Old tutor users and tutor profiles cleared.\n");

    // Hash password
    const hashed = await bcrypt.hash("123456", 10);

    // Define sample tutor accounts
    const tutorAccounts = [
      {
        email: "tutor001@hcmut.edu.vn",
        fullname: "Đặng Bảo Trọng",
        phoneNumber: "0123456789",
        expertise: ["General Chemistry"],
        description: "Tutor General Chemistry"
      },
      {
        email: "tutor002@hcmut.edu.vn",
        fullname: "Nguyễn Văn A",
        phoneNumber: "0987654321",
        expertise: ["Physics 1", "Mechanics"],
        description: "Physics specialist"
      },
      {
        email: "tutor003@hcmut.edu.vn",
        fullname: "Trần Thị B",
        phoneNumber: "0912345678",
        expertise: ["Calculus A1"],
        description: "Math tutor"
      }
    ];

    // Process each tutor
    for (const t of tutorAccounts) {
      // 1️⃣ Create USER with role Tutor
      const user = await User.create({
        email: t.email,
        passwordHash: hashed,
        role: "Tutor",
        fullname: t.fullname,
        phoneNumber: t.phoneNumber,
        status: true
      });

      // 2️⃣ Create TUTOR linked with userId
      const tutor = await Tutor.create({
        userId: user._id,
        name: t.fullname,
        phone: t.phoneNumber,
        expertise: t.expertise,
        description: t.description,
        availability: {},
        bookedSlots: {}
      });

      // 3️⃣ Update user → set tutorProfile
      user.tutorProfile = tutor._id;
      await user.save();

      console.log(`Tutor created: ${t.fullname}`);
      console.log(`User ID: ${user._id}`);
      console.log(`Tutor ID: ${tutor._id}\n`);
    }

    console.log("All tutors created successfully!");

  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleTutorsLinked();
