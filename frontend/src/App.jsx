import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Setavailabililty from './pages/Setavailability/Setavailabililty'
import Tutorviewsessions from './pages/Tutorviewsessions/Tutorviewsessions'
import Footer from './components/Footer/Footer'



const App = () => {
  return (
    <>
      <div className='app'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tutoractivities' element={<Setavailabililty />} />
          <Route path='/tutorsessions' element={<Tutorviewsessions />} />
        </Routes>
      </div>
      <Footer />
    </>

  )
}

export default App
