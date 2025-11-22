import React from 'react'
import './Sessionlist.css'
import Searchbar from '../Searchbar/Searchbar';
import Sessioncard from '../Sessioncard/Sessioncard';
import Searchresultlist from '../Searchbar/Searchresultlist';
import { useState } from 'react';
import Sessionform from '../Sessionform/Sessionform';

const MOCK_SESSION_LIST_DATA = [
  {
    id: 1,
    title: 'General Chemistry (CH1003)_Đặng Bảo Trọng (CLC_HK251)',
    time: 'Monday 13:00-14:50',
    location: 'B1-303',
    capacity: 6,
    signedUp: 5,
    status: 'scheduled',
  },
  {
    id: 2,
    title: 'Advanced Mathematics (MATH201)_Lê Văn Nam (KT_HK251)',
    time: 'Tuesday 09:00-10:50',
    location: 'A5-101',
    capacity: 10,
    signedUp: 8,
    status: 'scheduled',
  },
  {
    id: 3,
    title: 'Physics I (PHY101)_Nguyễn Thị Hà (DT_HK251)',
    time: 'Wednesday 15:00-16:50',
    location: 'C2-205',
    capacity: 8,
    signedUp: 8,
    status: 'scheduled',
  },
];

const Sessionlist = () => {
  const sessionsToDisplay = MOCK_SESSION_LIST_DATA;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null); // null = create, object = edit

  // Click Handler for "+ Add Session"
  const handleAddClick = () => {
    setCurrentSession(null); // Clear data
    setIsFormOpen(true);
  };
  const handleEditSession = (session) => {
    // 1. EXTRACT SUBJECT NAME:
    // Split by '_' to remove the tutor name part. 
    // Example: "General Chemistry (CH1003)_Đặng..." -> "General Chemistry (CH1003)"
    const cleanName = session.title.split('_')[0];

    // 2. PARSE TIME:
    // Your mock data has "Monday 13:00-14:50".
    // We need to separate "Monday" and the time slots.
    // NOTE: Since your form uses 1-hour slots (13:00-14:00), you might need to map 
    // "13:00-14:50" to ['13:00 - 14:00', '14:00 - 15:00'].
    // For now, I'll just parse the day.
    const [dayStr, timeStr] = session.time.split(' '); 

    setCurrentSession({
        id: session.id,
        name: cleanName, // This should now match one of the SUBJECTS in the form
        location: session.location,
        dayOfWeek: dayStr, // e.g., "Monday"
        capacity: session.capacity,
        studentCount: session.signedUp,
        // You might need logic here to turn "13:00-14:50" into array ["13:00-14:00", "14:00-15:00"]
        // sending empty array for now if parsing logic isn't strict
        timeSlots: [] 
    });
    setIsFormOpen(true);
  };
  const handleSave = (formData) => {
    console.log("Saving data:", formData);
    // Logic to update backend or state array goes here
  };
  const [results, setResults] = useState([]);
  return (
    <div>
      
      <div className="session-list-container">
        <h2 className="session-list-title">My sessions</h2>
        <div className="search-filter-controls">
          <div className="search-bar-wrapper">
            <Searchbar setResults={setResults} />
            {/*can be used, but not recommend <Searchresultlist results={results} /> */}
          </div>
          <div className="controls-right">
            <div className="filter-buttons">
              <button className="filter-button">Subject</button>
              <button className="filter-button">Semester</button>
            </div>
            <button className="add-session-button" onClick={handleAddClick}>
              + Add Session
            </button>
          </div>
        </div>
        {sessionsToDisplay.map(session => (
          <Sessioncard 
            key={session.id} 
            data={session} 
            role="tutor" 
            onEdit={(s) => {
              setCurrentSession(s);  // set session to edit
              setIsFormOpen(true);   // open the modal
            }}
          />
        ))}

      </div>

      {/* THE form */}
      <Sessionform
         isOpen={isFormOpen} 
         onClose={() => setIsFormOpen(false)} 
         onSave={handleSave}
         sessionData={currentSession}
       />
    </div>
  )
}

export default Sessionlist
