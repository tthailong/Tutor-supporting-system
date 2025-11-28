import mongoose from "mongoose";

// --------------------
// SUBJECT SCHEMA
// --------------------
const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Subject code is required"],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// --------------------
// INDEXES
// --------------------
subjectSchema.index({ code: 1 });
subjectSchema.index({ isActive: 1 });

// --------------------
// EXPORT MODEL
// --------------------
const subjectModel = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
export default subjectModel;
