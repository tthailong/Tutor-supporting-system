import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // Notification type for different workflows
    type: {
        type: String,
        enum: ["MANUAL_MATCH_REQUEST", "MATCH_SUCCESS", "SESSION_REMINDER", "GENERAL"],
        default: "GENERAL"
    },

    // For manual match requests
    subject: {
        type: String,
        trim: true
    },

    selectedTimeSlot: {
        date: { type: String }, // YYYY-MM-DD format
        startTime: { type: String }, // HH:mm format
        endTime: { type: String } // HH:mm format
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    registrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration"
    },

    relatedSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session"
    },

    // Additional metadata for extensibility
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    isRead: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Notification", notificationSchema);