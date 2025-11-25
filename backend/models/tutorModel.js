import mongoose from "mongoose";

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

  // Key-based dynamic availability: "YYYY-MM-DD": [timeslots]
  availability: {
    type: Map,
    of: [timeSlotSchema],
    default: {}
  },

  bookedSlots: {
    type: [bookedSlotSchema],
    default: []
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
// EXPORT MODEL
// --------------------
const tutorModel = mongoose.models.Tutor || mongoose.model("Tutor", tutorSchema);
export default tutorModel;
