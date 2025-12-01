import React, { useState, useEffect } from 'react';
import './Sessionlist.css';
import Searchbar from '../Searchbar/Searchbar';
import Sessioncard from '../Sessioncard/Sessioncard';
import Sessionform from '../Sessionform/Sessionform';

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token"); // <-- retrieve token separately
const TUTOR_ID = user?.tutorProfile;

const API_URL = "http://localhost:4000/api/session";

const getFirstSessionTime = (scheduleMap) => {
  if (!scheduleMap || typeof scheduleMap !== 'object') return null;

  // Convert the Map keys (dates) into an array and sort them
  const dates = Object.keys(scheduleMap).sort();

  if (dates.length === 0) return null;

  // Get the first date string (e.g., "2025-11-29")
  const firstDateString = dates[0];
  const firstSlots = scheduleMap[firstDateString];

  if (!firstSlots || firstSlots.length === 0) return null;

  // Get the first slot (e.g., {start: "08:00", end: "10:00"})
  const firstSlot = firstSlots[0];

  // Format the date for display (e.g., Mon 08:00)
  const dateObj = new Date(firstDateString);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[dateObj.getDay()];

  return `${day} ${firstSlot.start} - ${firstSlot.end}`;
};

const Sessionlist = ({ role = 'tutor' }) => {
  const [sessions, setSessions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/tutor/${TUTOR_ID}`, {
        headers: {
          'Authorization': `Bearer ${token}` // ✅ FIX: Send the token
        }
      });
      const data = await res.json();
      console.log("RAW backend data:", data);   // ⬅️ See exactly what backend returns
      if (data.success) {
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. Delete Handler
  const handleDeleteSession = async (session) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      const res = await fetch(`${API_URL}/${session._id}`, { method: 'DELETE' });

      if (res.status === 403) {
        alert("Cannot delete: Students are already enrolled in this session.");
      } else if (res.ok) {
        alert("Session deleted successfully.");
        fetchSessions();
      } else {
        const err = await res.json();
        alert("Error: " + err.message);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // 3. Save (Create/Edit) Handler
  const handleSave = async (formData) => {
    try {
      const selectedDate = formData.startDate; // YYYY-MM-DD string from form

      // Transform the selected time slots into the array format
      const slotsArray = formData.timeSlots.map(slotStr => {
        const [start, end] = slotStr.split(" - ");
        return { start: start.trim(), end: end.trim() };
      });

      // Construct the schedule Map object { "YYYY-MM-DD": [slots] }
      const scheduleMapObject = {};
      if (selectedDate && slotsArray.length > 0) {
        scheduleMapObject[selectedDate] = slotsArray;
      } else {
        // Handle error if no date/slots selected
        throw new Error("Please select a Start Date and at least one Time Slot.");
      }

      const payload = {
        tutorId: TUTOR_ID,
        subject: formData.name,
        location: formData.location,
        startDate: new Date(selectedDate), // Send Date object for validation
        // Duration is optional/metadata, can be removed or kept as 1 (single day session)
        duration: parseInt(formData.duration),
        capacity: parseInt(formData.capacity),
        description: formData.description,
        schedule: scheduleMapObject
      };

      let url = `${API_URL}/create`;
      let method = 'POST';

      if (currentSession && currentSession._id) {
        // EDIT - Note: For simple edits, only non-schedule fields should change if students are enrolled.
        url = `${API_URL}/${currentSession._id}`;
        method = 'PUT';

        // If editing, we only send fields that are editable (Capacity, Location, Description)
        // Schedule should ONLY be sent if no students are enrolled (handled by backend)
        if (formData.studentCount > 0) {
          // Restricted payload for enrolled sessions
          delete payload.schedule;
          delete payload.startDate;
          delete payload.duration;
          delete payload.subject;
        }
      }

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(currentSession ? "Session updated!" : "Session created!");
        setIsFormOpen(false);
        setCurrentSession(null);
        fetchSessions();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Save failed: ${error.message}`);
    }
  };

  // 4. Prepare Edit Form
  const handleEditClick = (session) => {
    // Get the explicit date key from the schedule map
    const scheduleKeys = Object.keys(session.schedule || {}).sort();
    const firstDateString = scheduleKeys.length > 0 ? scheduleKeys[0] : null;

    // Get the slots for that date
    const timeSlots = firstDateString ?
      session.schedule[firstDateString].map(t => `${t.start} - ${t.end}`) : [];

    const uiSession = {
      _id: session._id,
      name: session.subject,
      location: session.location,
      capacity: session.capacity,
      duration: session.duration,
      description: session.description,
      studentCount: session.students ? session.students.length : 0,
      startDate: firstDateString,
      timeSlots: timeSlots
    };
    console.log('Editing session:', uiSession);
    setCurrentSession(uiSession);
    setIsFormOpen(true);
  };

  // Filter
  const filteredSessions = sessions.filter(s => {
    return (s.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const subjects = [...new Set(sessions.map(s => s.subject))];

  return (
    <div>
      <div className="session-list-container">
        <h2 className="session-list-title">My sessions</h2>

        <div className="search-filter-controls">
          <div className="search-bar-wrapper">
            <Searchbar onSearch={(val) => setSearchTerm(val)} />
          </div>
          <div className="controls-right">
            <div className="filter-buttons">
              <select onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm}>
                <option value=''>All Subjects</option>
                {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
              </select>
            </div>
            {role === 'tutor' && (
              <button className="add-session-button" onClick={() => { setCurrentSession(null); setIsFormOpen(true); }}>
                + Add Session
              </button>
            )}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="no-sessions">No sessions found.</p>
        ) : (
          filteredSessions.map(session => (
            <Sessioncard
              key={session._id}
              data={{
                title: `${session.subject}`,
                time: getFirstSessionTime(session.schedule) || "N/A",
                signedUp: session.students ? session.students.length : 0,
                timeTable: [],
                ...session
              }}
              role={role}
              onEdit={() => handleEditClick(session)}
              onDelete={() => handleDeleteSession(session)}
            />
          ))
        )}
      </div>

      {role === 'tutor' && (
        <Sessionform
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setCurrentSession(null); }}
          onSave={handleSave}
          sessionData={currentSession}
        />
      )}
    </div>
  );
}

export default Sessionlist; 