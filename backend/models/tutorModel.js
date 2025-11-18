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
  name: { type: String, required: true },

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
// EXPORT MODEL
// --------------------
const tutorModel = mongoose.model("Tutor", tutorSchema);
export default tutorModel;
