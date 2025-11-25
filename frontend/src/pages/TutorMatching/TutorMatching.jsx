import React from 'react'
import './Tutormatching.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'

const TutorMatching = () => {
  return (
    <div className='tutormatching-container'>
      <Sidebar />
      <div className="tutormatching-content">
        <Outlet />
      </div>
    </div>
  )
}

export default TutorMatching
