import mongoose from "mongoose";

const studentProgressSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    
    // Progress Tracking Data
    strengths: {
        type: String,
        maxlength: 500
    },
    areasForImprovement: {
        type: String,
        maxlength: 500
    },
    recommendations: {
        type: String,
        maxlength: 500
    },
    overallProgress: {
        type: String,
        enum: ["excellent", "good", "average", "needs_improvement"],
        required: true
    },
    
    // Status & Metadata
    status: {
        type: String,
        enum: ["draft", "submitted"],
        default: "draft"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index để một tutor chỉ có một draft/student-session
studentProgressSchema.index(
    { tutor: 1, student: 1, session: 1, status: 1 }, 
    { unique: true, partialFilterExpression: { status: "draft" } }
);

// Index cho query performance
studentProgressSchema.index({ student: 1, session: 1 });
studentProgressSchema.index({ tutor: 1, createdAt: -1 });

const StudentProgress = mongoose.model("StudentProgress", studentProgressSchema);
export default StudentProgress;