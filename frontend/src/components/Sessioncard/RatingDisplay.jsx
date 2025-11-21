import React from 'react';
import './RatingDisplay.css';

const RatingDisplay = ({ rating, size = 'medium', showText = true }) => {
  if (!rating || rating === 0) {
    return (
      <div className="rating-display no-rating">
        <span className="rating-text">Not rated yet</span>
      </div>
    );
  }

  return (
    <div className={`rating-display ${size}`}>
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`rating-star ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
      {showText && (
        <span className="rating-text">
          {rating}.0/5.0
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;