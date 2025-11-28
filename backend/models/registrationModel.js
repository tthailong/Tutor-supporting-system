import mongoose from "mongoose";

// --------------------
// TIME SLOT SCHEMA (for preferred time slots)
// --------------------
const timeSlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/  // HH:mm format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,  // HH:mm format
    validate: {
      validator: function(value) {
        // Ensure endTime > startTime
        return value > this.startTime;
      },
      message: "endTime must be greater than startTime"
    }
  }
}, { _id: false });

// --------------------
// REGISTRATION SCHEMA (Matching Request)
// --------------------
const registrationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"]
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    default: null  // Nullable for auto-match requests
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  preferredTimeSlots: {
    type: [timeSlotSchema],
    validate: {
      validator: function(slots) {
        return slots && slots.length > 0;
      },
      message: "At least one preferred time slot is required"
    }
  },
  status: {
    type: String,
    enum: ["Pending", "Matched", "Rejected", "Coordinator_Review"],
    default: "Pending",
    required: true
  },
  type: {
    type: String,
    enum: ["Manual", "Auto"],
    required: [true, "Request type is required"]
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0
  },
  processingTime: {
    type: Number,  // in milliseconds
    default: 0
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true  // Auto-generates createdAt and updatedAt
});

// --------------------
// INDEXES for Query Optimization
// --------------------
registrationSchema.index({ studentId: 1, status: 1 });  // For "My Requests" queries
registrationSchema.index({ tutorId: 1, status: 1 });    // For tutor dashboard
registrationSchema.index({ createdAt: -1 });            // For sorting by date
registrationSchema.index({ status: 1, type: 1 });       // For analytics

// --------------------
// INSTANCE METHODS
// --------------------

// Get status color for frontend display
registrationSchema.methods.getStatusColor = function() {
  const colorMap = {
    "Pending": "yellow",
    "Matched": "green",
    "Rejected": "red",
    "Coordinator_Review": "orange"
  };
  return colorMap[this.status] || "gray";
};

// --------------------
// EXPORT MODEL
// --------------------
const registrationModel = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
export default registrationModel;
