import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    relatedSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session"
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