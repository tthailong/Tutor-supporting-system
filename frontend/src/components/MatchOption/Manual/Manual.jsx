import React, { useState } from 'react';
import './Manual.css';
import { FaStar, FaUserCircle, FaSearch, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { MOCK_TUTORS, SUBJECTS, DAYS } from '../../../data/mockTutors';

const Manual = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedDay, setSelectedDay] = useState("Any Day");

  const handleSelect = (tutor) => {
    const confirm = window.confirm(`Do you want to select ${tutor.name} as your tutor?`);
    if (confirm) {
        alert(`Successfully registered with ${tutor.name}!`);
        navigate('/tutorsessions');
    }
  };

  const filteredTutors = MOCK_TUTORS.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tutor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || tutor.subject === selectedSubject;
    const matchesDay = selectedDay === "Any Day" || tutor.availability === selectedDay;

    return matchesSearch && matchesSubject && matchesDay;
  });

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
              {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <select 
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="tutor-grid">
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor) => (
            <div key={tutor.id} className="tutor-card">
              <div className="tutor-avatar">
                <FaUserCircle />
              </div>
              <div className="tutor-info">
                <h3>{tutor.name}</h3>
                <p className="tutor-subject">{tutor.subject}</p>
                <div className="tutor-meta">
                  <span className="tutor-availability">Available: {tutor.availability}</span>
                </div>
                <div className="tutor-rating">
                  <FaStar className="star-icon" />
                  <span>{tutor.rating}</span>
                </div>
                <p className="tutor-bio">{tutor.bio}</p>
              </div>
              <button className="select-btn" onClick={() => handleSelect(tutor)}>
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
      <button className="back-btn" onClick={() => navigate('/tutormatching')}>Back to Options</button>
    </div>
  );
};

export default Manual;
