import React, { useState, useEffect } from 'react';
import './Sessionform.css'; 

const SUBJECTS = [
  "General Chemistry (CH1003)",
  "Calculus 1 (MA1001)",
  "Physics 1 (PH1001)",
  "Intro to Programming (CO1005)",
  "Linear Algebra (MA1003)"
];

const DURATIONS = [
  { label: "1 Session (Single Day)", value: 1 },
  { label: "1 Week", value: 7 },
  { label: "2 Weeks", value: 14 },
  { label: "4 Weeks (1 Month)", value: 28 },
  { label: "Semester (15 Weeks)", value: 105 }
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Generate single-hour slots
const TIME_SLOTS = [];
for (let i = 7; i <= 17; i++) {
  TIME_SLOTS.push(`${i}:00 - ${i + 1}:00`);
}

const SessionForm = ({ isOpen, onClose, onSave, sessionData }) => {
  const initialState = {
    name: "",
    location: "",
    dayOfWeek: "Monday",
    timeSlots: [], // Changed from single string to Array
    capacity: 10,
    duration: 1,
    description: "",
    studentCount: 0 
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (sessionData) {
      // Ensure timeSlots is an array even if data is missing/malformed
      const loadedSlots = Array.isArray(sessionData.timeSlots) 
        ? sessionData.timeSlots 
        : (sessionData.time ? [sessionData.time] : []); 

      setFormData({ 
        ...initialState, 
        ...sessionData,
        timeSlots: loadedSlots
      });
    } else {
      setFormData(initialState);
    }
  }, [sessionData, isOpen]);

  if (!isOpen) return null;

  // Generic handler for text/select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Specific handler for Time Slot checkboxes
  const handleSlotChange = (slot) => {
    setFormData(prev => {
      const currentSlots = prev.timeSlots;
      if (currentSlots.includes(slot)) {
        // Uncheck: remove from array
        return { ...prev, timeSlots: currentSlots.filter(s => s !== slot) };
      } else {
        // Check: add to array
        return { ...prev, timeSlots: [...currentSlots, slot].sort() }; // Sort keeps them in order
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (!formData.name || !formData.location || formData.timeSlots.length === 0) {
      alert("Please select a subject, location, and at least one time slot.");
      return;
    }
    onSave(formData);
    onClose();
  };

  const isSubjectLocked = sessionData && formData.studentCount > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sessionData ? "Edit Session" : "Create New Session"}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          
          {/* Subject */}
          <div className="form-group full-width">
            <label>Subject Name *</label>
            <select name="name" value={formData.name} onChange={handleChange} disabled={isSubjectLocked}>
              <option value="" disabled>Select a subject</option>
              {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            {isSubjectLocked && <span className="helper-text">Cannot change subject: students enrolled.</span>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. B1-303" />
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" />
          </div>

          {/* Day */}
          <div className="form-group">
            <label>Day *</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
              {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label>Duration *</label>
            <select name="duration" value={formData.duration} onChange={handleChange}>
              {DURATIONS.map(dur => <option key={dur.value} value={dur.value}>{dur.label}</option>)}
            </select>
          </div>

          {/* Time Slots (Multiple Selection) */}
          <div className="form-group full-width">
            <label>Time Slots (Select all that apply) *</label>
            <div className="timeslots-grid">
              {TIME_SLOTS.map(slot => (
                <label key={slot} className={`slot-checkbox ${formData.timeSlots.includes(slot) ? 'selected' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.timeSlots.includes(slot)}
                    onChange={() => handleSlotChange(slot)}
                  />
                  {slot}
                </label>
              ))}
            </div>
            <div className="selected-summary">
               Selected: {formData.timeSlots.length > 0 ? formData.timeSlots.join(", ") : "None"}
            </div>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </div>

          <div className="modal-actions full-width">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;