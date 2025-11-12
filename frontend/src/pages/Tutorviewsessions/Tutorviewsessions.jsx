import React from 'react'
import './Tutorviewsessions.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import Sessioncard from '../../components/Sessioncard/Sessioncard'
import Sessionlist from '../../components/Sessionlist/Sessionlist'



const Tutorviewsessions = () => {
  return (
    <div className='tutorviewsessions-container'>
      <Sidebar />
      <Sessionlist />
    </div>
  )
}

export default Tutorviewsessions
