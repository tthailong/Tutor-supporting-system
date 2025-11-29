import React, { useState, useEffect } from 'react';
import './Manual.css';
import { FaStar, FaUserCircle, FaSearch, FaFilter, FaTimes, FaCheckCircle, FaCalendar, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getTutors, createManualMatchRequest, getTutorAvailability } from '../../../services/apiService';

const Manual = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedDay, setSelectedDay] = useState("Any Day");

  // API state
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for subject and timeslot selection
  const [tutorAvailability, setTutorAvailability] = useState(null);
  const [selectedSubjectForRequest, setSelectedSubjectForRequest] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Fetch tutors from API
  useEffect(() => {
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedDay]);

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {};
      
      if (selectedSubject !== "All Subjects") {
        filters.subject = selectedSubject;
      }
      
      if (selectedDay !== "Any Day") {
        filters.dayOfWeek = selectedDay;
      }
      
      const response = await getTutors(filters);
      setTutors(response.data.tutors);
    } catch (err) {
      setError('Failed to load tutors. Make sure backend is running on http://localhost:4000');
      console.error('Error fetching tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClick = async (tutor) => {
    setSelectedTutor(tutor);
    setSelectedSubjectForRequest(tutor.expertise?.[0] || "");
    setSelectedTimeSlot(null);
    setLoadingAvailability(true);
    
    try {
      // Fetch tutor's full availability
      const response = await getTutorAvailability(tutor._id);
      // Backend returns { availability, bookedSlots } directly
      setTutorAvailability(response.data.availability);
      setShowConfirmModal(true);
    } catch (err) {
      alert('Failed to load tutor availability: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedSubjectForRequest) {
      alert('Please select a subject');
      return;
    }

    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createManualMatchRequest({
        tutorId: selectedTutor._id,
        subject: selectedSubjectForRequest,
        selectedTimeSlot,
        description: `Manual selection for ${selectedSubjectForRequest}`
      });
      
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      alert('Failed to create match request: ' + (err.response?.data?.message || err.message));
      console.error('Error creating match:', err);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/tutorsessions');
  };

  // Format availability for display
  const getAvailabilitySlots = () => {
    if (!tutorAvailability) return [];
    
    const slots = [];
    for (const [date, timeSlots] of Object.entries(tutorAvailability)) {
      timeSlots.forEach(slot => {
        slots.push({
          date,
          startTime: slot.start,
          endTime: slot.end,
          display: `${date} | ${slot.start} - ${slot.end}`
        });
      });
    }
    return slots.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Filter tutors by search term (client-side)
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tutor.bio && tutor.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const subjects = ["All Subjects", ...new Set(tutors.flatMap(t => t.expertise || []))];
  const days = ["Any Day", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="manual-container">
      <div className="manual-header">
        <h2>Find Your Tutor</h2>
        <p>Search and filter to find the perfect match for your academic needs.</p>
      </div>

      <div className="filter-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <select 
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading tutors...</p>
        </div>
      )}

      {error && (
        <div className="error-state" style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#fee', 
          color: '#c00',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p>{error}</p>
          <button onClick={fetchTutors} style={{ marginTop: '10px' }}>Retry</button>
        </div>
      )}
      
      {!loading && !error && (
        <div className="tutor-grid">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <div key={tutor._id} className="tutor-card">
                <div className="tutor-avatar">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&size=120&background=random&bold=true`}
                    alt={tutor.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div className="tutor-info">
                  <h3>{tutor.name}</h3>
                  <p className="tutor-subject">{tutor.expertise?.join(', ')}</p>
                  <div className="tutor-meta">
                    <span className="tutor-availability">
                      Available: {tutor.availabilityDays} days
                    </span>
                    <span>Sessions: {tutor.totalSessions}</span>
                  </div>
                  <div className="tutor-rating">
                    <FaStar className="star-icon" />
                    <span>{tutor.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <p className="tutor-bio">{tutor.bio}</p>
                </div>
                <button className="select-btn" onClick={() => handleSelectClick(tutor)}>
                  Select Tutor
                </button>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No tutors found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
      
      <button className="back-btn" onClick={() => navigate('/tutormatching')}>Back to Options</button>

      {/* Confirmation Modal with Subject and Timeslot Selection */}
      {showConfirmModal && selectedTutor && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowConfirmModal(false)}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <h2>Book Session with {selectedTutor.name}</h2>
            </div>
            
            <div className="modal-body">
              <div className="tutor-preview">
                <div className="tutor-avatar-large">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTutor.name)}&size=150&background=4EAAF3&color=fff&bold=true`}
                    alt={selectedTutor.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #4EAAF3'
                    }}
                  />
                </div>
                <h3>{selectedTutor.name}</h3>
                <p className="subject">{selectedTutor.expertise?.join(', ')}</p>
              </div>

              {/* Subject Selection */}
              <div className="selection-group">
                <label><FaFilter /> Select Subject:</label>
                <select 
                  value={selectedSubjectForRequest}
                  onChange={(e) => setSelectedSubjectForRequest(e.target.value)}
                  className="subject-select"
                >
                  {selectedTutor.expertise?.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Timeslot Selection */}
              <div className="selection-group">
                <label><FaClock /> Select Time Slot:</label>
                {loadingAvailability ? (
                  <p>Loading availability...</p>
                ) : (
                  <div className="timeslot-list">
                    {getAvailabilitySlots().length > 0 ? (
                      getAvailabilitySlots().map((slot, index) => (
                        <div 
                          key={index}
                          className={`timeslot-item ${selectedTimeSlot?.date === slot.date && selectedTimeSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                          onClick={() => setSelectedTimeSlot({
                            date: slot.date,
                            startTime: slot.startTime,
                            endTime: slot.endTime
                          })}
                        >
                          <FaCalendar style={{ marginRight: '8px' }} />
                          {slot.display}
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#999' }}>No available time slots</p>
                    )}
                  </div>
                )}
              </div>

              {selectedTimeSlot && (
                <div className="selected-info">
                  <p><strong>Selected:</strong> {selectedSubjectForRequest} on {selectedTimeSlot.date} at {selectedTimeSlot.startTime}-{selectedTimeSlot.endTime}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirmSelection}
                disabled={isSubmitting || !selectedTimeSlot}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedTutor && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="modal-header-with-icon">
              <h2>Request Sent!</h2>
              <div className="modal-icon-right success">
                <FaCheckCircle />
              </div>
            </div>
            
            <div className="modal-body">
              <p className="success-message">
                Your booking request to <strong>{selectedTutor.name}</strong> has been submitted successfully!
              </p>
              <div className="next-steps">
                <h4>What's Next?</h4>
                <ul>
                  <li>✅ Your tutor will be notified</li>
                  <li>⏳ Wait for tutor confirmation</li>
                  <li>📧 You'll receive a notification when confirmed</li>
                  <li>📅 Check your sessions page for status</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleSuccessClose}>
                Go to My Sessions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manual;
