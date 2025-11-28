import mongoose from "mongoose";
import User from "./User.js";
import SessionEvaluation from "./sessionEvaluationModel.js";
import StudentProgress from "./studentProgressModel.js";
// --------------------
// TIME ENUM (Same as Tutor)
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
// SESSION SCHEMA
// --------------------
const sessionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  location: { type: String, required: true },

  schedule: {
    type: Map,
    of: [timeSlotSchema], 
    required: true
  },

  // Metadata
  startDate: { type: Date, required: true }, // Useful for sorting
  duration: { type: Number, required: true }, // in weeks

  
  capacity: { type: Number, required: true },
  description: { type: String },

  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  //dummy, need to change to student later

  evaluations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SessionEvaluation" 
  }],

  studentProgress: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProgress" 
  }],
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    }

}, { timestamps: true });

// --------------------
// PRE-SAVE: Check Overlap Per Date inside the Session itself
// --------------------
sessionSchema.pre("save", function (next) {
  const schedule = this.schedule || new Map();

  for (const [date, slots] of schedule.entries()) {
    if (hasOverlap(slots)) {
      return next(new Error(`Session schedule overlaps on ${date}`));
    }
  }

  if (schedule.size > 0) {
    const sortedDates = Array.from(schedule.keys()).sort();
    this.startDate = new Date(sortedDates[0]); // First Key
    this.endDate = new Date(sortedDates[sortedDates.length - 1]); // Last Key
  }

  next();
});

// --------------------
// METHOD: Get All Specific Dates
// (Helper to easily extract dates for the Tutor BookedSlots update)
// --------------------
sessionSchema.methods.getSessionDates = function() {
  const allBookings = [];
  const schedule = this.schedule || new Map();

  // Get the first date in schedule as reference
  const sortedDates = Array.from(schedule.keys()).sort();
  if (sortedDates.length === 0) return allBookings;

  const firstDate = new Date(sortedDates[0]);
  const duration = this.duration || 1; // fallback 1 week

  for (let week = 0; week < duration; week++) {
    for (const [dateString, slots] of schedule.entries()) {
      const baseDate = new Date(dateString);
      baseDate.setDate(baseDate.getDate() + 7 * week); // shift by week

      slots.forEach(slot => {
        allBookings.push({
          date: new Date(baseDate),
          start: slot.start,
          end: slot.end
        });
      });
    }
  }
  return allBookings;
};

const sessionModel = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default sessionModel;