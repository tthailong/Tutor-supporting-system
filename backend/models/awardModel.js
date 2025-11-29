import mongoose from "mongoose";

const awardSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutor",
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    credits: {
        type: Number,
        required: true,
        default: 0
    },
    scholarship: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

const awardModel = mongoose.models.award || mongoose.model("award", awardSchema);

export default awardModel;