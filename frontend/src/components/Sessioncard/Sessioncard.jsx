import React from 'react'
import './Sessioncard.css'
import RatingDisplay from './RatingDisplay';
import FeedbackForm from './FeedbackForm';
import ProgressTracker from './ProgressTracker';

const SessioncardWithFeedback = ({ sessionData, role = 'student', onEdit, onDelete }) => {
  // Sync state with props when parent re-renders (e.g. after list refresh)
  const [session, setSession] = React.useState(sessionData);
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [showProgressTracker, setShowProgressTracker] = React.useState(false);

  React.useEffect(() => {
    setSession(sessionData);
  }, [sessionData]);

    // Inside SessioncardWithFeedback
  const handleFeedbackSubmit = (feedbackData) => {
    setSession(prev => ({ ...prev, studentFeedback: feedbackData }));
    setShowFeedbackForm(false);
  };

  const handleProgressSave = (progressData) => {
    setSession(prev => ({ ...prev, tutorProgress: progressData }));
    setShowProgressTracker(false);
  };

  // Safe defaults
  const studentFeedback = session.studentFeedback || { submitted: false, rating: 0 };
  const tutorProgress = session.tutorProgress || { lastUpdated: null };
  const { title, time, location, capacity, signedUp } = session;

  return (
    <div className="session-card">
      <div className="session-details-container">
        <div className="session-details-left">
           <div className="title">{title}</div>
           <div className="subtitle-line">
             <div className="time-and-location">
               <span>{time}</span> <span>{location}</span>
             </div>
             <div className="capacity">{signedUp}/{capacity}</div>
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
              <span onClick={() => onDelete?.(session)} title="Delete">
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

const Sessioncard = ({ data, role = 'student', onEdit, onDelete }) => {
  return (
    <SessioncardWithFeedback 
      sessionData={data}
      role={role}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default Sessioncard;