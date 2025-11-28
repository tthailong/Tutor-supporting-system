import mongoose from "mongoose";
import dotenv from "dotenv";
import tutorModel from "./models/tutorModel.js";

dotenv.config();

const createSampleTutors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected\n");

    // 🧹 Delete old tutors
    await tutorModel.deleteMany({});
    console.log("Old tutors cleared.\n");

    // ------------------------------
    // VALID SAMPLE STRUCTURE (NEW SCHEMA)
    // ------------------------------
    const sampleTutors = [
      {
        name: "Đặng Bảo Trọng",
        phone: "0123456789",
        expertise: ["General Chemistry"],
        description: "Tutor General Chemistry",

        // MUST BE a Map of date → timeSlots[]
        availability: {},

        // MUST be Map of date → bookedSlot[]
        bookedSlots: {}
      },
      {
        name: "Nguyễn Văn A",
        phone: "0987654321",
        expertise: ["Physics 1", "Mechanics"],
        description: "Physics specialist",
        availability: {},
        bookedSlots: {}
      },
      {
        name: "Trần Thị B",
        phone: "0912345678",
        expertise: ["Calculus A1"],
        description: "Math tutor",
        availability: {},
        bookedSlots: {}
      }
    ];

    // Insert tutors
    await tutorModel.insertMany(sampleTutors);

    console.log("Sample tutors created:\n");
    sampleTutors.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name}`);
      console.log(`   Phone: ${t.phone}`);
      console.log(`   Expertise: ${t.expertise.join(", ")}`);
      console.log();
    });

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleTutors();
