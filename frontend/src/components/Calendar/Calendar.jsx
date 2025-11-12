import React, { useState } from 'react';
import './Calendar.css';

// Define the time slots and days
const TIME_SLOTS = [
  '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00',
  '11:00-12:00', '12:00-13:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
  '17:00-18:00'
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Initial state for the calendar
const initialAvailability = {
  'Mon-10:00-11:50': true,
  'Mon-13:00-14:50': true,
  'Wed-9:00-10:50': true,
  'Thu-9:00-10:50': true,
  'Thu-10:00-11:50': true,
};

const Calendar = () => {
  const [availability, setAvailability] = useState(initialAvailability);

  // Toggle a specific slot
  const handleToggle = (day, time) => {
    const key = `${day}-${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Submit handler
  const handleSubmit = () => {
    console.log('Submitting Availability:', availability);
    alert('Availability Submitted! (Check Console)');
  };

  // Delete handler
  const handleDelete = () => {
    console.log('Deleting all current availability.');
    setAvailability({});
    alert('Availability Deleted!');
  };

  return (
    <div className='main-content'>
      <div className='calendar-container'>
        {/* Header Row */}
        <div className='calendar-header'>
          <div className='header-cell'></div>
          {DAYS.map(day => (
            <div key={day} className='header-cell'>{day}</div>
          ))}
          <button onClick={handleDelete} className='button-delete'>Delete</button>
        </div>

        {/* Calendar Rows */}
        {TIME_SLOTS.map(time => (
          <div key={time} className='calendar-row'>
            <div className='time-cell'>{time}</div>
            {DAYS.map(day => {
              const key = `${day}-${time}`;
              const isSelected = availability[key];
              return (
                <div
                  key={key}
                  className='circle-cell'
                  onClick={() => handleToggle(day, time)}
                >
                  <div className={isSelected ? 'circle-selected' : 'circle-unselected'}>
                    {isSelected && <span className='check-mark'>✔</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Submit Button */}
        <div className='submit-row'>
          <button onClick={handleSubmit} className='button-submit'>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
