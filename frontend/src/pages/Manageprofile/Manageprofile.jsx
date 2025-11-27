import React from 'react'
import './Manageprofile.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import Calendar from '../../components/Calendar/Calendar'
import WeekCalendar from '../../components/WeekCalendar/WeekCalendar'
import Profile from '../../components/Profile/Profile'

const Manageprofile = () => {
  return (
    <div className='profile-container'>
        <Sidebar/>
        <Profile/>
    </div>
  )
}

export default Manageprofile