import mongoose from "mongoose";

const sessionEvaluationSchema = new mongoose.Schema({
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
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    // Rating & Feedback
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: "Rating must be an integer"
        }
    },
    comments: {
        type: String,
        maxlength: 1000
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

// Compound index để một student chỉ có một draft/session
sessionEvaluationSchema.index(
    { student: 1, session: 1, status: 1 }, 
    { unique: true, partialFilterExpression: { status: "draft" } }
);

// Index cho query performance
sessionEvaluationSchema.index({ session: 1, status: 1 });
sessionEvaluationSchema.index({ tutor: 1, createdAt: -1 });

const SessionEvaluation = mongoose.model("SessionEvaluation", sessionEvaluationSchema);
export default SessionEvaluation;