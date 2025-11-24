import React, { useState } from 'react';
import './Automatic.css';
import { FaCog, FaCheckCircle, FaTimesCircle, FaUserCircle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MOCK_TUTORS } from '../../../data/mockTutors';

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

  const startMatching = () => {
    // Simulate algorithm delay
    setTimeout(() => {
      // Logic to find a match from MOCK_TUTORS
      // 1. Filter by Subject (fuzzy match)
      // 2. Filter by Availability (exact match or "Anytime")
      
      const candidates = MOCK_TUTORS.filter(tutor => {
        const subjectMatch = tutor.subject.toLowerCase().includes(formData.subject.toLowerCase());
        const availabilityMatch = formData.availability === "Anytime" || 
                                  formData.availability === "Weekdays" || // Simplified logic: assume all tutors are weekdays for now or check specific day
                                  tutor.availability === formData.availability;
        
        // For this mock, let's be lenient on availability if it's "Weekdays" or "Anytime"
        // If user picks specific day (e.g. Monday), we try to match.
        // But our form has "Weekdays", "Weekends" etc.
        // Let's just match subject primarily for the demo.
        return subjectMatch;
      });

      if (candidates.length > 0) {
        // Pick the best rated one or random
        const bestMatch = candidates.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);
        setMatchedTutor(bestMatch);
        setStep('success');
      } else {
        // Fallback if no exact subject match found, maybe pick a random high rated one or show fail
        // For demo purposes, let's just pick a random one if no subject match, 
        // OR show a "No match found" state.
        // Let's show a "No match found" state to be realistic.
        setMatchedTutor(null);
        setStep('failed');
      }
    }, 3000);
  };

  const handleAccept = () => {
    alert(`Great! You have been matched with ${matchedTutor.name}.`);
    navigate('/tutorsessions');
  };

  const handleReject = () => {
    if (window.confirm("Are you sure you want to reject this match? We can try again.")) {
      setStep('form'); 
      setMatchedTutor(null);
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
                <label>Subject (e.g., CS101, Calculus)*</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  placeholder="Enter course code or name"
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
                  placeholder="e.g., Recursion, Integration"
                />
              </div>

              <div className="form-group">
                <label>Preferred Availability*</label>
                <select name="availability" value={formData.availability} onChange={handleInputChange} required>
                  <option value="">Select a day...</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Anytime">Anytime</option>
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
            <h2>Match Found!</h2>
            <div className="match-card">
              <div className="match-avatar">
                <FaUserCircle />
              </div>
              <h3>{matchedTutor.name}</h3>
              <p className="match-subject">{matchedTutor.subject}</p>
              <div className="match-meta">
                 <span>Available: {matchedTutor.availability}</span>
                 <span>Rating: {matchedTutor.rating} ⭐</span>
              </div>
              <p className="match-bio">{matchedTutor.bio}</p>
              <div className="match-actions">
                <button className="accept-btn" onClick={handleAccept}>
                  <FaCheckCircle /> Accept
                </button>
                <button className="reject-btn" onClick={handleReject}>
                  <FaTimesCircle /> Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'failed' && (
           <div className="state-failed">
             <div className="auto-icon-large" style={{color: '#e74c3c'}}>
               <FaTimesCircle />
             </div>
             <h2>No Match Found</h2>
             <p>We couldn't find a tutor matching your specific criteria.</p>
             <button className="start-btn" onClick={() => setStep('form')}>Try Again</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Automatic;
