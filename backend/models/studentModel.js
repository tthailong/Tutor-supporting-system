import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  name: { type: String, trim: true },
  phone: { type: String, trim: true },
  hcmutID: { type: String, trim: true },
  description: { type: String, default: "" },
  gpa: { type: Number, min: 0, max: 10 },
  
  currentSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  currentTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tutor" }]
}, { timestamps: true });

const studentModel = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default studentModel;
