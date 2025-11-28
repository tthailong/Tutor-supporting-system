import mongoose from "mongoose";

// --------------------
// TUTOR MATCH LOG SCHEMA (Analytics)
// --------------------
const tutorMatchLogSchema = new mongoose.Schema({
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0
  },
  processingTime: {
    type: Number,  // in milliseconds
    required: true
  },
  failureReason: {
    type: String,
    trim: true
  },
  candidateTutors: [{
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor"
    },
    score: {
      type: Number,
      default: 0
    }
  }],
  selectedTutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor"
  }
}, {
  timestamps: true
});

// --------------------
// INDEXES for Analytics Queries
// --------------------
tutorMatchLogSchema.index({ attemptedAt: -1 });
tutorMatchLogSchema.index({ success: 1 });
tutorMatchLogSchema.index({ registrationId: 1 });

// --------------------
// STATIC METHODS for Analytics
// --------------------

// Get success rate for a date range
tutorMatchLogSchema.statics.getSuccessRate = async function(startDate, endDate) {
  const results = await this.aggregate([
    {
      $match: {
        attemptedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: ["$success", 1, 0] }
        }
      }
    },
    {
      $project: {
        successRate: {
          $multiply: [
            { $divide: ["$successful", "$total"] },
            100
          ]
        },
        total: 1,
        successful: 1
      }
    }
  ]);
  
  return results.length > 0 ? results[0] : { successRate: 0, total: 0, successful: 0 };
};

// Get average processing time
tutorMatchLogSchema.statics.getAverageProcessingTime = async function(startDate, endDate) {
  const results = await this.aggregate([
    {
      $match: {
        attemptedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        avgProcessingTime: { $avg: "$processingTime" }
      }
    }
  ]);
  
  return results.length > 0 ? results[0].avgProcessingTime : 0;
};

// --------------------
// EXPORT MODEL
// --------------------
const tutorMatchLogModel = mongoose.models.TutorMatchLog || mongoose.model("TutorMatchLog", tutorMatchLogSchema);
export default tutorMatchLogModel;
