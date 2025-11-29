import mongoose from "mongoose";
//import User from "./userModel.js";

// --------------------
// TIME ENUM
// --------------------
const timeEnum = [
  "07:00","08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00","16:00","17:00"
];

// --------------------
// HELPER: Check Overlap
// --------------------
function hasOverlap(slots) {
  if (!Array.isArray(slots)) return false;

  const parsed = slots.map(s => ({
    start: Number(s.start.replace(":", "")),
    end: Number(s.end.replace(":", "")),
  }));

  parsed.sort((a, b) => a.start - b.start);

  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i].start < parsed[i - 1].end) {
      return true;
    }
  }
  return false;
}

// --------------------
// TIME SLOT SCHEMA
// --------------------
const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    enum: timeEnum,
    required: true
  },
  end: {
    type: String,
    enum: timeEnum,
    required: true,
    validate: {
      validator: function (value) {
        return Number(value.replace(":", "")) > Number(this.start.replace(":", ""));
      },
      message: "endTime must be greater than startTime"
    }
  }
}, { _id: false });


// --------------------
// BOOKED SLOT SCHEMA
// --------------------
const bookedSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    enum: timeEnum,
    required: true
  },
  end: {
    type: String,
    enum: timeEnum,
    required: true,
    validate: {
      validator: function (value) {
        return Number(value.replace(":", "")) > Number(this.start.replace(":", ""));
      },
      message: "endTime must be greater than startTime"
    }
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  }
}, { _id: false });


// --------------------
// TUTOR SCHEMA
// --------------------
const tutorSchema = new mongoose.Schema({
  // Link to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false  // Optional for backwards compatibility
  },
  
  name: { type: String, required: true },
  phone: { type: String, required: true },
  expertise: { type: [String], required: true },
  description: { type: String },
  
  // Matching module fields
  bio: {
    type: String,
    default: ""
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalSessions: {
    type: Number,
    default: 0,
    min: 0
  },
  activeStudents: {
    type: Number,
    default: 0,
    min: 0
  },

  // Key-based dynamic availability: "YYYY-MM-DD": [timeslots]
  availability: {
    type: Map,
    of: [timeSlotSchema],
    default: {}
  },

  bookedSlots: {
    type: Map,
    of: [bookedSlotSchema],
    default: {}
  }
});


// --------------------
// PRE-SAVE: Check Overlap Per Date
// --------------------
tutorSchema.pre("save", function (next) {
  const availability = this.availability || new Map();

  for (const [date, slots] of availability.entries()) {
    if (hasOverlap(slots)) {
      return next(new Error(`Time slots overlap on ${date}`));
    }
  }

  next();
});

// --------------------
// INSTANCE METHODS (for matching module)
// --------------------

// Update tutor rating
tutorSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.totalSessions || 0;
  if (totalRatings > 0) {
    this.rating = ((this.rating * totalRatings) + newRating) / (totalRatings + 1);
  } else {
    this.rating = newRating;
  }
  return this.rating;
};

// Increment active students count
tutorSchema.methods.incrementActiveStudents = function() {
  this.activeStudents = (this.activeStudents || 0) + 1;
  return this.activeStudents;
};

// Decrement active students count
tutorSchema.methods.decrementActiveStudents = function() {
  if (this.activeStudents > 0) {
    this.activeStudents -= 1;
  }
  return this.activeStudents;
};


// --------------------
// EXPORT MODEL
// --------------------
const tutorModel = mongoose.models.Tutor || mongoose.model("Tutor", tutorSchema);
export default tutorModel;
