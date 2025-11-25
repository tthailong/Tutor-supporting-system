import mongoose from "mongoose";

// --------------------
// TIME ENUM (reuse your tutorModel timeEnum)
const timeEnum = [
  "07:00","08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00","16:00","17:00","18:00"
];

// --------------------
// SESSION SCHEMA
// --------------------
const sessionSchema = new mongoose.Schema({
  subject: { type: String, required: true },

  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",   // link to Tutor model
    required: true
  },

  location: { type: String, required: true },

  // Array of multiple slots (day + start + end)
  timeTable: {
    type: [{
      day: {
        type: String,
        enum: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        required: true
      },
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
          validator: function(value) {
            return Number(value.replace(":", "")) > Number(this.start.replace(":", ""));
          },
          message: "endTime must be greater than startTime"
        }
      }
    }],
    required: true
  },

  startDate: { type: Date, required: true },   // first date of session
  duration: { type: Number, required: true },  // in weeks
  capacity: { type: Number, required: true },

  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  status: {
    type: String,
    enum: ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },

  studentCheckIn: { type: Date },
  tutorCheckIn: { type: Date }
}, {
  timestamps: true
});

// --------------------
// INSTANCE METHODS
// --------------------

// Generate all dates for each slot based on startDate + duration
sessionSchema.methods.generateSessionDates = function() {
  const allDates = [];
  const start = new Date(this.startDate);

  for (let week = 0; week < this.duration; week++) {
    for (const slot of this.timeTable) {
      // Calculate the actual date of this slot
      const sessionDate = new Date(start);
      const targetDayIndex = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(slot.day);
      const startDayIndex = sessionDate.getDay(); // 0 = Sun, 1 = Mon
      const dayDiff = (targetDayIndex - startDayIndex + 7) % 7 + week * 7;
      sessionDate.setDate(sessionDate.getDate() + dayDiff);

      allDates.push({
        date: sessionDate,
        day: slot.day,
        start: slot.start,
        end: slot.end
      });
    }
  }

  return allDates;
};

// Check for conflict with tutor's bookedSlots
sessionSchema.methods.hasConflict = function(bookedSlots) {
  const sessionDates = this.generateSessionDates();

  for (const sessionSlot of sessionDates) {
    const slotStart = Number(sessionSlot.start.replace(":", ""));
    const slotEnd = Number(sessionSlot.end.replace(":", ""));
    for (const booked of bookedSlots) {
      const bookedDate = new Date(booked.date);
      const bookedStart = Number(booked.startTime.replace(":", ""));
      const bookedEnd = Number(booked.endTime.replace(":", ""));
      if (bookedDate.toDateString() === sessionSlot.date.toDateString()) {
        if (slotStart < bookedEnd && slotEnd > bookedStart) {
          return true;
        }
      }
    }
  }

  return false;
};

// --------------------
// EXPORT MODEL
// --------------------
const sessionModel = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default sessionModel;
