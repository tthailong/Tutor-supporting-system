import React, { useState } from 'react';
import './Automatic.css';
import { FaCog, FaCheckCircle, FaTimesCircle, FaUserCircle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { autoMatch } from '../../../services/apiService';

const Automatic = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // form, matching, success, failed
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    availability: '',
    learningStyle: 'visual',
    additionalNotes: ''
  });
  const [matchedTutor, setMatchedTutor] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.availability) {
      alert("Please fill in the required fields.");
      return;
    }
    setStep('matching');
    startMatching();
  };

  const startMatching = async () => {
    try {
      const response = await autoMatch({
        subject: formData.subject,
        description: formData.topic || `Help with ${formData.subject}`,
        availableTimeSlots: [
          {
            dayOfWeek: formData.availability,
            startTime: "09:00",
            endTime: "11:00"
          }
        ],
        priorityLevel: "High"
      });

      // Check if match was successful
      if (response.data.registration.status === 'Matched') {
        setMatchedTutor(response.data.matchedTutor);
        setMatchScore(response.data.matchScore);
        setStep('success');
      } else {
        // Coordinator Review
        setErrorMessage(response.data.message || 'No suitable match found');
        setStep('failed');
      }
    } catch (error) {
      console.error('Auto-match error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to find a match');
      setStep('failed');
    }
  };

  const handleAccept = () => {
    alert(`Great! You have been matched with ${matchedTutor.name}.`);
    navigate('/tutorsessions');
  };

  const handleReject = () => {
    if (window.confirm("Are you sure you want to reject this match? We can try again.")) {
      setStep('form'); 
      setMatchedTutor(null);
      setMatchScore(0);
    }
  };

  return (
    <div className="automatic-container">
      <div className="auto-content">
        
        {step === 'form' && (
          <div className="requirements-form-container">
            <div className="auto-header">
               <FaCog className="header-icon" />
               <h2>Tell Us Your Needs</h2>
               <p>We'll use this information to find the perfect tutor for you.</p>
            </div>
            
            <form onSubmit={handleSubmitForm} className="requirements-form">
              <div className="form-group">
                <label>Subject (e.g., Physics 1, Calculus A1)*</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Specific Topic/Area of Struggle</label>
                <input 
                  type="text" 
                  name="topic" 
                  value={formData.topic} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Derivatives, Integration"
                />
              </div>

              <div className="form-group">
                <label>Preferred Availability*</label>
                <select name="availability" value={formData.availability} onChange={handleInputChange} required>
                  <option value="">Select a day...</option>
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                  <option value="Sat">Saturday</option>
                  <option value="Sun">Sunday</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Learning Style</label>
                <select name="learningStyle" value={formData.learningStyle} onChange={handleInputChange}>
                  <option value="visual">Visual (Diagrams, Videos)</option>
                  <option value="auditory">Auditory (Discussion, Listening)</option>
                  <option value="kinesthetic">Kinesthetic (Hands-on, Practice)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="back-btn-simple" onClick={() => navigate('/tutormatching')}>Cancel</button>
                <button type="submit" className="submit-btn">
                  Find Match <FaArrowRight />
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'matching' && (
          <div className="state-matching">
            <div className="spinner"></div>
            <h3>Finding the perfect match...</h3>
            <p>Analyzing your requirements against our tutor database.</p>
          </div>
        )}

        {step === 'success' && matchedTutor && (
          <div className="state-success">
            <div className="success-icon-large">
              <FaCheckCircle />
            </div>
            <h2>Perfect Match Found!</h2>
            <div className="match-score-badge">
              Match Score: {matchScore} / 17 points
            </div>
            
            <div className="tutor-preview">
              <div className="tutor-avatar-large">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(matchedTutor.name)}&size=150&background=4CAF50&color=fff&bold=true`}
                  alt={matchedTutor.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #4CAF50'
                  }}
                />
              </div>
              <h3>{matchedTutor.name}</h3>
              <p className="subject">{matchedTutor.expertise?.join(', ')}</p>
              <div className="tutor-stats">
                <div className="stat">
                  <FaStar style={{ color: '#ffd700' }} />
                  <span>{matchedTutor.rating} Rating</span>
                </div>
              </div>
              <p className="bio">{matchedTutor.bio}</p>
            </div>
            
            <div className="next-steps">
              <h4>What's Next?</h4>
              <ul>
                <li>✅ Your tutor has been notified</li>
                <li>⏳ Wait for tutor confirmation</li>
                <li>📧 You'll receive an update via email</li>
                <li>📅 Check your sessions page for details</li>
              </ul>
            </div>
            
            <div className="action-buttons">
              <button className="btn-secondary" onClick={handleReject}>
                Try Different Match
              </button>
              <button className="btn-primary" onClick={handleAccept}>
                Accept Match
              </button>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="state-failed">
            <div className="failed-icon-large">
              <FaTimesCircle />
            </div>
            <h2>No Match Found</h2>
            
            <p className="failed-message">{errorMessage}</p>
            
            <div className="coordinator-notice">
              <h4>📋 What Happens Now?</h4>
              <ul>
                <li>🔍 Your request has been queued for coordinator review</li>
                <li>👥 A coordinator will manually find a suitable tutor</li>
                <li>📧 You'll be notified once a match is found</li>
                <li>⏱️ This usually takes 24-48 hours</li>
              </ul>
            </div>
            
            <p className="suggestion-text">
              <strong>Tip:</strong> Try adjusting your availability or subject preferences for better matches.
            </p>
            
            <div className="action-buttons">
              <button className="btn-secondary" onClick={() => navigate('/tutormatching')}>
                Back to Options
              </button>
              <button className="btn-primary" onClick={() => setStep('form')}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Automatic;