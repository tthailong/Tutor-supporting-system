import mongoose from "mongoose";

// --------------------
// TIME ENUM
// --------------------
const timeEnum = [
  "07:00","08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00","16:00","17:00","18:00"
];

// --------------------
// HELPER: Check Overlap
// --------------------
function hasOverlap(slots) {
  if (!Array.isArray(slots)) return false;

  // Convert "HH:MM" to number (e.g., "13:00" → 1300)
  const parsed = slots.map(s => ({
    start: Number(s.start.replace(":", "")),
    end: Number(s.end.replace(":", ""))
  }));

  // Sort by start time
  parsed.sort((a, b) => a.start - b.start);

  // Check adjacent for overlap
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i].start < parsed[i - 1].end) {
      return true; // overlapped
    }
  }

  return false;
}

// --------------------
// TIME SLOT SCHEMA
// --------------------
export const timeSlotSchema = new mongoose.Schema({
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
        // end must be > start
        return Number(value.replace(":", "")) > Number(this.start.replace(":", ""));
      },
      message: "endTime must be greater than startTime"
    }
  }
});

// --------------------
// WEEKLY AVAILABILITY SCHEMA
// --------------------
const weeklyAvailabilitySchema = new mongoose.Schema({
  Mon: {
    type: [timeSlotSchema],
    validate: {
      validator: (slots) => !hasOverlap(slots),
      message: "Monday timeslots overlap"
    }
  },
  Tue: {
    type: [timeSlotSchema],
    validate: {
      validator: (slots) => !hasOverlap(slots),
      message: "Tuesday timeslots overlap"
    }
  },
  Wed: {
    type: [timeSlotSchema],
    validate: {
      validator: (slots) => !hasOverlap(slots),
      message: "Wednesday timeslots overlap"
    }
  },
  Thu: {
    type: [timeSlotSchema],
    validate: {
      validator: (slots) => !hasOverlap(slots),
      message: "Thursday timeslots overlap"
    }
  },
  Fri: {
    type: [timeSlotSchema],
    validate: {
      validator: (slots) => !hasOverlap(slots),
      message: "Friday timeslots overlap"
    }
  }
});

// --------------------
// TUTOR SCHEMA
// --------------------
const tutorSchema = new mongoose.Schema({
  // Link to User Account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false  // Optional for backward compatibility
  },
  
  name: { type: String, required: true },
  phone: { type: String, required: true },
  expertise: { type: [String], required: true },
  description: { type: String },
  
  // New fields for matching algorithm
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
    validate: {
      validator: function(value) {
        return value >= 0 && value <= 5;
      },
      message: "Rating must be between 0 and 5"
    }
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

  availability: {
    type: weeklyAvailabilitySchema,
    required: true,
    default: {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: []
    }
  }
});


// --------------------
// INDEXES for Query Optimization
// --------------------
tutorSchema.index({ expertise: 1, rating: -1 });  // Compound index for filtering
tutorSchema.index({ rating: -1 });                // For sorting by rating
tutorSchema.index({ userId: 1 });                 // For user lookup


// --------------------
// VIRTUAL FIELDS
// --------------------

// Calculate workload score (lower is better for matching)
tutorSchema.virtual("workloadScore").get(function() {
  return this.activeStudents;
});


// --------------------
// INSTANCE METHODS
// --------------------

// Update rating based on new session feedback
tutorSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.totalSessions;
  if (totalRatings === 0) {
    this.rating = newRating;
  } else {
    this.rating = ((this.rating * totalRatings) + newRating) / (totalRatings + 1);
  }
};

// Increment active students count
tutorSchema.methods.incrementActiveStudents = function() {
  this.activeStudents += 1;
};

// Decrement active students count
tutorSchema.methods.decrementActiveStudents = function() {
  if (this.activeStudents > 0) {
    this.activeStudents -= 1;
  }
};


// --------------------
// EXPORT MODEL
// --------------------
const tutorModel = mongoose.model("Tutor", tutorSchema);
export default tutorModel;
