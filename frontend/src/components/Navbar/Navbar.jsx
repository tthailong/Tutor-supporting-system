import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const [menu,setMenu] = useState("home");
    const [unread, setUnread] = useState(0);

    useEffect(() => {
    const userId = "69285ff4fcc2424d7f1b9234"; 
    fetch(`/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        const count = data.notifications.filter(n => !n.isRead).length;
        setUnread(count);
      });
}, []);
  return (
    <div className='navbar'>
        <img src={assets.logo} alt="" className='logo'/>
        <ul className='navbar-menu'>
            <li> <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":"nonactive"}>home</Link></li>
            <li> <Link to='/tutoractivities' onClick={()=>setMenu("activities")} className={menu==="activities"?"active":"nonactive"}>activities</Link></li>
        </ul>
        <div className="navbar-right">
            <Link to="/notifications" className="navbar-noti">
            <img src={assets.noti} alt="" />
            {unread > 0 && <div className="dot">{unread}</div>}
            </Link>
            <div className="navbar-noti">
                <img src={assets.account}  alt="" />
            </Link>
        </div>
    </div>
  )
}

export default Navbar
