import mongoose from "mongoose";
import { timeSlotSchema } from "./tutorModel.js";

// Main Session Schema
const sessionSchema = new mongoose.Schema({
    name: { type: String, required: true },

    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // assuming Tutor is also a User
        required: true
    },

    location: { type: String, required: true },

    timeTable: timeSlotsSchema, // Reusing timeSlotSchema from tutorModel..js

    duration: {
        type: Number,
        required: true // in weeks
    },

    capcity: {
        type: Number,
        required: true
    },

    studentcount: {
        type: Number,
        default: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});


export default mongoose.model("Session", sessionSchema);
