import React from 'react'
import './Tutorviewsessions.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import Sessioncard from '../../components/Sessioncard/Sessioncard'

const Tutorviewsessions = () => {
  return (
    <div className='tutorviewsessions-container'>
      <Sidebar />
      <div className="session-card-wrapper">
        <Sessioncard role="tutor" />
      </div>
    </div>
  )
}

export default Tutorviewsessions
