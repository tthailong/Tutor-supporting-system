import React, { useEffect, useState } from "react";
import "./TimeSlotModal.css";

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const TimeSlotModal = ({ tutor, onClose, onSubmit }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formattedSlots, setFormattedSlots] = useState([]);

  // Convert availability into array format
  useEffect(() => {
    if (!tutor?.availability) return;

    const slots = [];

    for (const [date, times] of Object.entries(tutor.availability)) {
      const d = new Date(date);
      const dow = days[d.getDay()];

      times.forEach(t => {
        slots.push({
          dayOfWeek: dow,
          startTime: t.start,
          endTime: t.end
        });
      });
    }

    setFormattedSlots(slots);
  }, [tutor]);

  const handleSubmit = () => {
    if (!selectedSubject || !selectedSlot) return;

    onSubmit({
      subject: selectedSubject,
      preferredTimeSlots: [selectedSlot]
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Select Subject & Time Slot</h2>

        {/* SUBJECT */}
        <label>Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select subject</option>
          {tutor.expertise?.map((sub, idx) => (
            <option key={idx} value={sub}>{sub}</option>
          ))}
        </select>

        {/* TIME SLOTS */}
        <label>Available Time Slots:</label>
        <div className="slots-list">
          {formattedSlots.map((slot, index) => (
            <div
              key={index}
              className={`slot-item ${selectedSlot === slot ? "active" : ""}`}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.dayOfWeek} — {slot.startTime} → {slot.endTime}
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="submit-btn" onClick={handleSubmit}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;
