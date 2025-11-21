import React, { useState, useMemo } from 'react';
import './WeekCalendar.css';

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const WeekCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});

  // --- Date Helpers ---

  // Get the Monday of the current week based on currentDate state
  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  // Generate the 5 days (Mon-Fri) for the displayed week
  const weekDays = useMemo(() => {
    const start = getStartOfWeek(new Date(currentDate));
    const days = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  // Format helpers
  const formatDateKey = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
  const formatHeaderDate = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // --- Handlers ---

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleJumpToToday = () => setCurrentDate(new Date());

  const handleToggle = (date, time) => {
    const key = `${formatDateKey(date)}-${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting:', availability);
    alert('Schedule saved to console!');
  };

  const handleDelete = () => {
    if(window.confirm("Clear all selections?")) {
      setAvailability({});
    }
  };

  // --- Render Variables ---
  
  const startOfWeekStr = formatHeaderDate(weekDays[0]);
  const endOfWeekStr = formatHeaderDate(weekDays[4]);

  return (
    <div className='app-container'>
      <div className='calendar-card'>
        
        {/* --- Top Navigation Bar --- */}
        <div className='calendar-top-bar'>
          <div className='week-info'>
            <h2>Weekly Schedule</h2>
            <p className='date-range'>
              Week: <span>{startOfWeekStr}</span> - <span>{endOfWeekStr}</span>
            </p>
          </div>
          
          <div className='nav-controls'>
            <button onClick={handleJumpToToday} className='btn-today'>Today</button>
            <div className='arrow-group'>
              <button onClick={handlePrevWeek} className='btn-arrow'>&lt;</button>
              <button onClick={handleNextWeek} className='btn-arrow'>&gt;</button>
            </div>
          </div>
        </div>

        {/* --- Grid Header (Days) --- */}
        <div className='calendar-grid'>
          <div className='header-corner'></div> {/* Empty top-left corner */}
          
          {weekDays.map((date, index) => {
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div key={index} className={`header-day ${isToday ? 'today' : ''}`}>
                <span className='day-name'>{DAYS_OF_WEEK[index]}</span>
                <span className='day-number'>{date.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* --- Grid Body (Time Slots) --- */}
        <div className='calendar-body'>
          {TIME_SLOTS.map(time => (
            <div key={time} className='time-row'>
              <div className='time-label'>{time}</div>
              
              {weekDays.map((date) => {
                const key = `${formatDateKey(date)}-${time}`;
                const isSelected = availability[key];
                
                return (
                  <div 
                    key={key} 
                    className={`slot-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggle(date, time)}
                  >
                    <div className='slot-content'>
                      {isSelected && <span className='check-icon'>✔</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* --- Footer Actions --- */}
        <div className='calendar-footer'>
          <button onClick={handleDelete} className='btn-text delete'>Clear All</button>
          <button onClick={handleSubmit} className='btn-primary'>Save Schedule</button>
        </div>

      </div>
    </div>
  );
};

export default WeekCalendar;