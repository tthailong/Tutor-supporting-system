import express from "express";
import mongoose from "mongoose";
import Tutor from "../models/tutorModel.js";
import Session from "../models/sessionModel.js";

// --------------------
// CREATE SESSION CONTROLLER
// --------------------
export const createSession = async (req, res) => {
  try {
    const {
      tutorId,
      subject,
      location,
      startDate,   // first date of session
      duration,    // in weeks
      timeTable,   // array of slots [{day, start, end}, ...]
      capacity
    } = req.body;

    // --- 1. Find tutor ---
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // --- 2. Validate all requested slots against tutor availability ---
    const isAllSlotsAvailable = timeTable.every(slot => {
      const availableSlots = tutor.availability[slot.day] || [];
      const slotStart = Number(slot.start.replace(":", ""));
      const slotEnd = Number(slot.end.replace(":", ""));
      return availableSlots.some(av => {
        const avStart = Number(av.start.replace(":", ""));
        const avEnd = Number(av.end.replace(":", ""));
        return slotStart >= avStart && slotEnd <= avEnd;
      });
    });

    if (!isAllSlotsAvailable) {
      return res.status(400).json({ message: "One or more requested time slots are outside tutor availability" });
    }

    // --- 3. Check for conflicts with tutor's bookedSlots ---
    const tempSession = new Session({ startDate, duration, timeTable });
    const hasConflict = tempSession.hasConflict(tutor.bookedSlots || []);
    if (hasConflict) {
      return res.status(400).json({ message: "Requested time conflicts with existing booked sessions" });
    }

    // --- 4. Create new session ---
    const newSession = new Session({
      subject,
      tutor: tutor._id,
      location,
      startDate,
      duration,
      timeTable,
      capacity
    });

    await newSession.save();

    // --- 5. Add booked slots to tutor ---
    const sessionDates = newSession.generateSessionDates();
    const bookedEntries = sessionDates.map(slot => ({
      date: slot.date,
      startTime: slot.start,
      endTime: slot.end,
      sessionId: newSession._id
    }));

    tutor.bookedSlots.push(...bookedEntries);
    await tutor.save();

    return res.status(201).json({
      message: "Session created successfully",
      session: newSession
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
