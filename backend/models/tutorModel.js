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

  const parsed = slots.map(s => ({
    start: Number(s.start.replace(":", "")),
    end: Number(s.end.replace(":", ""))
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
}, { _id: false });

// --------------------
// BOOKED SLOT SCHEMA (ACTUAL SESSIONS)
// --------------------
const bookedSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
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
  name: { type: String, required: true },
  phone: { type: String, required: true },
  expertise: { type: [String], required: true },
  description: { type: String },

  // Weekly recurring availability
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
  },

  // Actual booked sessions
  bookedSlots: {
    type: [bookedSlotSchema],
    default: []
  }
});

// --------------------
// EXPORT MODEL
// --------------------
const tutorModel = mongoose.models.Tutor || mongoose.model("Tutor", tutorSchema);
export default tutorModel;
