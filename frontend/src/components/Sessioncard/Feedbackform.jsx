import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = ({ session, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(session.studentFeedback?.rating || 0);
  const [comment, setComment] = useState(session.studentFeedback?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }
    onSubmit({
      rating,
      comment,
      submitted: true,
      date: new Date().toISOString()
    });
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-form">
          <div className="form-header">
            <h3>📝 Evaluation Form</h3>
            <p>Share your feedback for: <strong>{session.title}</strong></p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Rate the lesson quality:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-text">
                  {rating > 0 ? `${rating}.0/5.0` : 'Select rating'}
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Comments:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about the session? Any suggestions for improvement?"
                rows="5"
                className="form-textarea"
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onCancel} className="btn btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn btn-submit">
                ✅ Submit Evaluation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;