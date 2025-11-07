import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import ManageActivities from './pages/ManageActivities/Manageactivities'



const App = () => {
  return (
    <div className='app'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/manageactivities' element={<ManageActivities/>} />
      </Routes>
    </div>
  )
}

export default App
