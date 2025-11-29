import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Manageprofile from './pages/Manageprofile/Manageprofile'
import Setavailabililty from './pages/Setavailability/Setavailabililty'
import Tutorviewsessions from './pages/Tutorviewsessions/Tutorviewsessions'
import TutorMatching from './pages/TutorMatching/TutorMatching'
import Optionlist from './components/MatchOption/Optionlist'
import Manual from './components/MatchOption/Manual/Manual'
import Automatic from './components/MatchOption/Automatic/Automatic'
import Footer from './components/Footer/Footer'
import Login from './components/Login/Login'
import StudentViewCourse from './pages/StudentViewCourse/StudentViewCourse'
import SelectTimeSlot from './pages/SelectTimeSlot/SelectTimeSlot'
import NotificationsPage from './pages/NotificationPage/NotificationPage';
import Awards from './pages/Awards/Awards';


const App = () => {
  return (
    <>
      <div className='app'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/profile' element={<Manageprofile />} />
          <Route path='/tutoractivities' element={<Setavailabililty />} />
          <Route path='/tutorsessions' element={<Tutorviewsessions />} />
          <Route path='/tutormatching' element={<TutorMatching />}>
            <Route index element={<Optionlist />} />
            <Route path='manual' element={<Manual />} />
            <Route path='auto' element={<Automatic />} />
          </Route>
          <Route path="/studentviewcourse" element={<StudentViewCourse />} />
          <Route path="/selecttimeslot/:sessionId" element={<SelectTimeSlot />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path='/awards' element={<Awards />} />
        </Routes>
      </div>
      <Footer />
    </>

  )
}

export default App
