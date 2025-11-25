import mongoose from "mongoose";
import dotenv from "dotenv";
import tutorModel from "./models/tutorModel.js";

dotenv.config();

const createSampleTutors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected\n");

    // 🧹 Delete old tutors to avoid duplicates
    await tutorModel.deleteMany({});
    console.log("Da xoa tutors cu\n");

    // 🧪 Sample tutor data
    const sampleTutors = [
      {
        name: "Đặng Bảo Trọng",
        phone: "0123456789",
        expertise: ["General Chemistry"],
        description: "Tutor General Chemistry",
        availability: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] },
        bookedSlots: []
      },
      {
        name: "Nguyễn Văn A",
        phone: "0987654321",
        expertise: ["Physics 1", "Mechanics"],
        description: "Physics specialist",
        availability: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] },
        bookedSlots: []
      },
      {
        name: "Trần Thị B",
        phone: "0912345678",
        expertise: ["Calculus A1"],
        description: "Math tutor",
        availability: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] },
        bookedSlots: []
      }
    ];

    // 📝 Insert to DB
    await tutorModel.insertMany(sampleTutors);

    console.log("Da tao thanh cong tutors mau:\n");
    sampleTutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name}`);
      console.log(`   Phone: ${tutor.phone}`);
      console.log(`   Expertise: ${tutor.expertise.join(", ")}`);
      console.log();
    });

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleTutors();
