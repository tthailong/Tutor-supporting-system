import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./SelectTimeSlot.css";

const SelectTimeSlot = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState("");

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(
          `/api/student/session/${sessionId}/reschedule`
        );
        const data = await res.json();

        if (data.success) {
          setSlots(data.availableSlots || []);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Server error loading available slots.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [sessionId]);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      alert("Please select a new time slot!");
      return;
    }

    try {
      const res = await fetch(
        `/api/student/session/${sessionId}/reschedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newStart: selectedSlot.start,
            newEnd: selectedSlot.end,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Session rescheduled successfully!");
        navigate("/studentviewcourse"); // quay về danh sách course
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server error performing reschedule.");
    }
  };

  return (
    <div className="select-timeslot-container">
      <Sidebar />

      <div className="timeslot-content">
        <h2>Select a New Time Slot</h2>

        {loading && <p>Loading available slots...</p>}
        {!loading && error && <p className="error">{error}</p>}

        {!loading && slots.length === 0 && (
          <p>No available time slots. Tutor has no free time.</p>
        )}

        <div className="slot-list">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`slot-card ${
                selectedSlot === slot ? "selected" : ""
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              <p>
                {slot.start} - {slot.end}
              </p>
            </div>
          ))}
        </div>

        {slots.length > 0 && (
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirm Reschedule
          </button>
        )}
      </div>
    </div>
  );
};

export default SelectTimeSlot;