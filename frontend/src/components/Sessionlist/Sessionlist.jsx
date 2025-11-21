import React from 'react'
import './Sessionlist.css'
import Searchbar from '../Searchbar/Searchbar';
import Sessioncard from '../Sessioncard/Sessioncard';
import Searchresultlist from '../Searchbar/Searchresultlist';
import { useState } from 'react';

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
  const handleAddSession = () => {
    console.log("Add new session clicked!");
    // Add navigation logic here
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
            <button className="add-session-button" onClick={handleAddSession}>
              + Add Session
            </button>
          </div>
        </div>
        <Sessioncard role="student" />

      </div>
    </div>
  )
}

export default Sessionlist
