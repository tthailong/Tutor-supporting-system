import React from 'react'
import './Setavailability.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import Calendar from '../../components/Calendar/Calendar'
import WeekCalendar from '../../components/WeekCalendar/WeekCalendar'

const Setavailabililty = () => {
  return (
    <div className='setavailability-container'>
        <Sidebar/>
        <WeekCalendar/>
        {/*<Calendar/>*/}
    </div>
  )
}

export default Setavailabililty
