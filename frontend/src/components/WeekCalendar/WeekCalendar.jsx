import React, { useState, useMemo, useEffect } from 'react';
import './WeekCalendar.css';

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
//const TUTOR_ID = "692918f2362827e136cb714f";
const user = JSON.parse(localStorage.getItem("user"));
const TUTOR_ID = user?.tutorProfile
console.log("TUTOR_ID:", TUTOR_ID);
console.log("user from localStorage:", localStorage.getItem("user"));



const WeekCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityState, setAvailabilityState] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);

  // --- 1. Fetch Data on Mount ---
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/tutors/${TUTOR_ID}`);
        const data = await res.json();
        
        if (data.success) {
          setBookedSlots(data.bookedSlots || {});
          
          // Convert DB Availability Map to UI State keys
          const newAvailState = {};
          // data.availability is object: { "2025-11-26": [{start: "07:00"...}] }
          Object.entries(data.availability || {}).forEach(([dateStr, slots]) => {
            slots.forEach(slot => {
               newAvailState[`${dateStr}-${slot.start}`] = true;
            });
          });
          setAvailabilityState(newAvailState);
        }
      } catch (error) {
        console.error("Error fetching tutor data:", error);
      }
    };

    fetchTutorData();
  }, []);
  // --- Date Helpers ---

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

  // Check if a specific slot is booked (GRAY Logic)
  const timeToNumber = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };
  
  // Correct booked check
  const checkIsBooked = (dateStr, timeStr) => {
    const daySlots = bookedSlots[dateStr];
    if (!daySlots) return false;
  
    const t = timeToNumber(timeStr);
  
    return daySlots.some(slot => {
      const start = timeToNumber(slot.start);
      const end = timeToNumber(slot.end);
      return start <= t && t < end;
    });
  };

  const isPastSlot = (date, time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0); // exact slot time
    return slotDate < new Date();
  };

  const handleToggle = (date, time, isBooked) => {
    if (isBooked || isPastSlot(date, time)) return; // cannot toggle booked or past
    const key = `${formatDateKey(date)}-${time}`;
    setAvailabilityState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    const availabilityPayload = compressSlots(availabilityState, weekDays);
  
    const payload = {
      tutorId: TUTOR_ID, 
      availability: availabilityPayload
    };
  
    console.log("Submitting:", payload);
  
    const res = await fetch("http://localhost:4000/api/tutors/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert("Availability updated!");
    } else {
      alert("Error: " + data.message);
    }
  };  

  const handleDelete = () => {
    if(window.confirm("Clear all selections?")) {
      setAvailabilityState({});
    }
  };

  // --- Data Transformation for Submit ---
  const preparePayload = () => {
    const result = {};

    weekDays.forEach(date => {
      const dateKey = formatDateKey(date);
      const daySlots = [];

      TIME_SLOTS.forEach(time => {
        const uiKey = `${dateKey}-${time}`;
        // If Green (true in state) AND not booked
        if (availabilityState[uiKey]) {
            // Find next hour for end time (Simple 1 hour logic)
            const timeIndex = TIME_SLOTS.indexOf(time);
            let endTime = TIME_SLOTS[timeIndex + 1];
            // Handle last slot case (17:00 -> 18:00)
            if(!endTime) endTime = (parseInt(time.split(':')[0]) + 1) + ":00";

            daySlots.push({ start: time, end: endTime });
        }
      });

      if (daySlots.length > 0) {
        result[dateKey] = daySlots;
      }
    });

    return result;
  };

  // --- Render Variables ---
  
  const startOfWeekStr = formatHeaderDate(weekDays[0]);
  const endOfWeekStr = formatHeaderDate(weekDays[4]);

  const compressSlots = (availabilityState, weekDays) => {
    const result = {};
  
    weekDays.forEach(date => {
      const dateKey = formatDateKey(date);
      const slots = [];
  
      let currentStart = null;
  
      TIME_SLOTS.forEach((slot, idx) => {
        const key = `${dateKey}-${slot}`;
        const isSelected = availabilityState[key] === true;
  
        if (isSelected && currentStart === null) {
          // Start block
          currentStart = slot;
        }
  
        const nextSlot = TIME_SLOTS[idx + 1];
        const nextKey = `${dateKey}-${nextSlot}`;
        const nextSelected = availabilityState[nextKey] === true;
  
        if (currentStart !== null && (!nextSelected || !nextSlot)) {
          // End block
          const end = nextSlot || slot;
          slots.push({ start: currentStart, end });
          currentStart = null;
        }
      });
  
      if (slots.length > 0) {
        result[dateKey] = slots;
      }
    });
  
    return result;
  };

  
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
                
                const uiKey = key;
                // 1. Check Gray (Booked)
                const isBooked = checkIsBooked(formatDateKey(date), time);

                
                // 2. Check Green (Available set by Tutor)
                //const isSelected = availabilityState[uiKey];
                const isSelected = availabilityState[uiKey];
                let cellClass = 'slot-cell';
                if (isBooked) cellClass += ' booked'; // Gray
                else if (isSelected) cellClass += ' selected'; // Green
                // else White

                return (
                  <div 
                    key={uiKey} 
                    className={cellClass}
                    onClick={() => handleToggle(date, time, isBooked)}
                  >
                    <div>
                      {isBooked}
                      {!isBooked && isSelected && <span className='check-icon'>✔</span>}
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