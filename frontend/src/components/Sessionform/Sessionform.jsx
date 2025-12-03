import React, { useState, useEffect } from 'react';
import './Sessionform.css';

//const SUBJECTS = [
//  "General Chemistry (CH1003)", "Calculus 1 (MT1003)",
//  "General Physics 1 (PH1003)", "Database Systems (CO2013)", "Linear Algebra (MT1007)", "Computer Network (CO3093)"
//];

const getTodayDateString = () => {
  const today = new Date();
  // Use local methods to get parts, then format manually
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TIME_SLOTS = [];
for (let i = 7; i <= 17; i++) {
  TIME_SLOTS.push(`${i < 10 ? '0' + i : i}:00 - ${i + 1 < 10 ? '0' + (i + 1) : i + 1}:00`);
}

const SessionForm = ({ isOpen, onClose, onSave, sessionData, tutor }) => {
  console.log("SessionForm tutor =", tutor);
  const SUBJECTS = tutor?.expertise || [];
  const initialState = {
    name: "", location: "",
    startDate: getTodayDateString(),
    timeSlots: [], capacity: 10, duration: 1, description: "", studentCount: 0, minimumCapacity: 1
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (sessionData) {
      setFormData({ ...initialState, ...sessionData });
    } else {
      setFormData(initialState);
    }
  }, [sessionData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Logic: Check if editing existing session AND students enrolled
  const isLocked = sessionData && formData.studentCount > 0;

  const handleSlotChange = (slot) => {
    if (isLocked) return; // Prevent change if locked
    setFormData(prev => {
      const currentSlots = prev.timeSlots;
      if (currentSlots.includes(slot)) return { ...prev, timeSlots: currentSlots.filter(s => s !== slot) };
      else return { ...prev, timeSlots: [...currentSlots, slot].sort() };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || formData.timeSlots.length === 0) {
      alert("Please fill required fields.");
      return;
    }
    // Basic check: Ensure selected date is not in the past relative to the current date string
    if (formData.startDate < getTodayDateString()) { alert("Start Date cannot be in the past."); return; }


    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sessionData ? "Edit Session" : "Create New Session"}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>

          <div className="form-group full-width">
            <label>Subject Name <span className="required">*</span></label>
            <select name="name" value={formData.name} onChange={handleChange} disabled={isLocked}>
              <option value="" disabled>Select a subject</option>
              {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Location <span className="required">*</span></label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Capacity {formData.minimumCapacity > 1 && `(Min: ${formData.minimumCapacity} students requesting)`}</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min={formData.minimumCapacity || formData.studentCount || 1}
            />
          </div>

          <div className="form-group">
            <label>Start Date <span className="required">*</span> {isLocked && "(Locked due to enrollment)"}</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              disabled={isLocked}
              min={getTodayDateString()}
            />
          </div>

          <div className="form-group">
            <label>Duration <span className="required">*</span> (Weeks)</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} disabled={isLocked} min="1" max="15" />
          </div>

          <div className="form-group full-width">
            <label>Time Slots <span className="required">*</span> {isLocked && "(Locked due to enrollment)"}</label>
            <div className={`timeslots-grid ${isLocked ? 'disabled-grid' : ''}`}>
              {TIME_SLOTS.map(slot => (
                <label key={slot} className={`slot-checkbox ${formData.timeSlots.includes(slot) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={formData.timeSlots.includes(slot)} onChange={() => handleSlotChange(slot)} disabled={isLocked} />
                  {slot}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea name="description" value={formData.description || ""} onChange={handleChange} rows="3" />
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