import React from 'react'
import './Sessioncard.css'
import RatingDisplay from './RatingDisplay';
import FeedbackForm from './FeedbackForm';
import ProgressTracker from './ProgressTracker';

// Cập nhật MOCK_SESSION_DATA trong Sessioncard.jsx


const handleReschedule = (s) => console.log(`Reschedule session ${s.id}`);
const handleEdit = (s) => console.log(`Edit session ${s.id}`);
const handleDelete = (s) => console.log(`Delete session ${s.id}`);

// NEW: State management component
const SessioncardWithFeedback = ({ sessionData, role = 'student', onEdit }) => {
  const [session, setSession] = React.useState(sessionData);
  
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [showProgressTracker, setShowProgressTracker] = React.useState(false);

  // NEW: Feedback submission handler
  const handleFeedbackSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    setSession({
      ...session,
      studentFeedback: feedbackData
    });
    setShowFeedbackForm(false);
  };

  // NEW: Progress save handler
  const handleProgressSave = (progressData) => {
    console.log('Progress saved:', progressData);
    setSession({
      ...session,
      tutorProgress: progressData
    });
    setShowProgressTracker(false);
  };

  const { title, time, location, capacity, signedUp, studentFeedback, tutorProgress } = session;

  return (
    <div className="session-card">
      <div className="session-details-container">
        <div className="session-details-left">
          <div className="title">{title}</div>
          <div className="subtitle-line">
            <div className="time-and-location">
              <span>{time}</span>
              <span>{location}</span>
            </div>
            <div className="capacity">
              {signedUp}/{capacity}
            </div>
          </div>

          {/* NEW: Feedback Section */}
          <div className="feedback-section">
            {role === 'student' && (
              <div className="student-feedback">
                {studentFeedback.submitted ? (
                  <div className="submitted-feedback">
                    <div className="feedback-header">
                      <span className="feedback-label">Your rating:</span>
                      <RatingDisplay rating={studentFeedback.rating} />
                    </div>
                    {studentFeedback.comment && (
                      <div className="feedback-comment">
                        "{studentFeedback.comment}"
                      </div>
                    )}
                    <div className="feedback-date">
                      Reviewed on {new Date(studentFeedback.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ) : (
                  <button 
                    className="give-feedback-btn"
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    📝 Give Feedback
                  </button>
                )}
              </div>
            )}
            
            {role === 'tutor' && (
              <div className="tutor-feedback">
                {tutorProgress.lastUpdated ? (
                  <div className="progress-info">
                    <div className="progress-header">
                      <span className="progress-label">Student Progress:</span>
                      <span className={`status-badge ${tutorProgress.overallStatus?.toLowerCase().replace(' ', '-')}`}>
                        {tutorProgress.overallStatus}
                      </span>
                    </div>
                    <div className="student-info-display">
                      <strong>{tutorProgress.studentName}</strong>
                      {tutorProgress.studentId && ` (ID: ${tutorProgress.studentId})`}
                    </div>
                    <div className="last-updated">
                      Updated: {new Date(tutorProgress.lastUpdated).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ) : (
                  <button 
                    className="record-progress-btn"
                    onClick={() => setShowProgressTracker(true)}
                  >
                    📊 Record Progress
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="action-icons">
          {/* NEW: Add feedback icon for students */}
          {role === 'student' && !studentFeedback.submitted && (
            <span onClick={() => setShowFeedbackForm(true)} title="Give Feedback">
              ⭐
            </span>
          )}
          
          <span onClick={() => handleReschedule(session)} title="Reschedule">
            🗓️
          </span>
          
          {role === 'tutor' && (
            <>
              {/* NEW: Add progress tracker icon for tutors */}
              <span onClick={() => setShowProgressTracker(true)} title="Record Progress">
                📊
              </span>
              <span onClick={() => onEdit?.(session)} title="Edit">
                ✏️
              </span>
              <span onClick={() => handleDelete(session)} title="Delete">
                🗑️
              </span>
            </>
          )}
        </div>
      </div>

      {/* NEW: Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          session={session}
          onSubmit={handleFeedbackSubmit}
          onCancel={() => setShowFeedbackForm(false)}
        />
      )}

      {/* NEW: Progress Tracker Modal */}
      {showProgressTracker && (
        <ProgressTracker
          session={session}
          onSave={handleProgressSave}
          onCancel={() => setShowProgressTracker(false)}
        />
      )}
    </div>
  );
}

// Keep the original component for backward compatibility
const Sessioncard = ({ data, role = 'student', onEdit }) => {
  return (
    <SessioncardWithFeedback 
      sessionData={data}
      role={role}
      onEdit={onEdit}
    />
  );
};


export default Sessioncard