import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./SelectTimeSlot.css";

const SelectTimeSlot = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null); // lưu A hoặc B
  const [error, setError] = useState("");

  // Fetch reschedule options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`/api/student/session/${sessionId}/reschedule`);
        const data = await res.json();

        if (data.success) {
          setAvailability(data.options.availability || []);
          setSessions(data.options.sessions || []);
        } else {
          setError(data.message);
        }

      } catch (err) {
        setError("Server error loading reschedule options.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [sessionId]);

  // Xác nhận reschedule
  const handleConfirm = async () => {
    if (!selectedOption) {
      alert("Please select a reschedule option!");
      return;
    }

    let payload = {};

    if (selectedOption.type === "availability") {
      payload = {
        type: "availability",
        date: selectedOption.date,
        start: selectedOption.start,
        end: selectedOption.end
      };
    } else if (selectedOption.type === "session") {
      payload = {
        type: "session",
        newSessionId: selectedOption.sessionId
      };
    }

    try {
      const res = await fetch(`/api/student/session/${sessionId}/reschedule`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert("Rescheduled successfully!");
        navigate("/studentviewcourse");
      } else {
        alert(data.message);
      }

    } catch (err) {
      alert("Server error performing reschedule.");
    }
  };

  const isSelected = (o) =>
    selectedOption &&
    selectedOption.type === o.type &&
    ((o.type === "availability" && o.start === selectedOption.start && o.end === selectedOption.end && o.date === selectedOption.date)
    || (o.type === "session" && o.sessionId === selectedOption.sessionId)
    );

  return (
    <div className="select-timeslot-container">
      <Sidebar />
      <div className="timeslot-content">
        <h2>Reschedule Session</h2>

        {loading && <p>Loading options...</p>}
        {!loading && error && <p className="error">{error}</p>}

        {/* =======================
            A — AVAILABILITY SLOTS
        ======================== */}
        <h3 className="section-title">Available Time Slots</h3>

        {availability.length === 0 && (
          <p className="sub-empty">No available free time slots</p>
        )}

        <div className="slot-list">
          {availability.map((slot, idx) => (
            <div
              key={idx}
              className={`slot-card ${isSelected(slot) ? "selected" : ""}`}
              onClick={() => setSelectedOption(slot)}
            >
              <p><strong>{slot.date}</strong></p>
              <p>{slot.start} - {slot.end}</p>
              <span className="tag tag-green">Availability</span>
            </div>
          ))}
        </div>

        {/* =======================
            B — JOINABLE SESSIONS
        ======================== */}
        <h3 className="section-title">Available Sessions</h3>

{sessions.length === 0 && (
  <p className="sub-empty">No joinable sessions available</p>
)}

<div className="slot-list">
  {sessions.map((s, idx) => (
    <div
      key={idx}
      className={`slot-card session-card ${isSelected(s) ? "selected" : ""}`}
      onClick={() => setSelectedOption(s)}
    >
      <div className="session-header">
        <strong className="session-title">{s.subject}</strong>
        <span className="tag tag-blue">Session</span>
      </div>

      <div className="session-body">
        <p className="session-date">
          <i className="ri-calendar-line icon"></i>
          {s.date}
        </p>

        <p className="session-time">
          <i className="ri-time-line icon"></i>
          {s.start} - {s.end}
        </p>

        <p className="session-capacity">
          <i className="ri-team-line icon"></i>
          {s.enrolled}/{s.capacity} students
        </p>
      </div>
    </div>
  ))}
</div>

        {/* =======================
            CONFIRM BUTTON
        ======================== */}
        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Reschedule
        </button>
      </div>
    </div>
  );
};

export default SelectTimeSlot;