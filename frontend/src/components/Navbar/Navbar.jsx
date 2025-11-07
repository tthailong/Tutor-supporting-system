import React, { useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
    const [menu,setMenu] = useState("home");

  return (
    <div className='navbar'>
        <img src={assets.logo} alt="" className='logo'/>
        <ul className='navbar-menu'>
            <li onClick={()=>setMenu("home")} className={menu==="home"?"active":"nonactive"}>home</li>
            <li onClick={()=>setMenu("activities")} className={menu==="activities"?"active":"nonactive"}>activities</li>
        </ul>
        <div className="navbar-right">
            <div className="navbar-noti">
                <img src={assets.noti}  alt="" />
                <div className="dot"></div>
            </div>
            <div className="navbar-noti">    
                <img src={assets.chat}  alt="" />
                <div className="dot"></div>
            </div>
            <div className="navbar-noti">
                <img src={assets.account}  alt="" />
            </div>
        </div>
    </div>
  )
}

export default Navbar
