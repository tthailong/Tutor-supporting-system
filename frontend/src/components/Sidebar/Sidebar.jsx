import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
    const [menu, setMenu] = useState("availability"); 

    return (
        <div className='sidebar'> 
            <div className="sidebar-options">
                <div onClick={() => setMenu("availability")} className={`sidebar-option ${menu === "availability" ? "active" : ""}`}>
                    <button className='sidebar-button'>Set availability</button>
                </div>
                <div onClick={() => setMenu("sessions")} className={`sidebar-option ${menu === "sessions" ? "active" : ""}`}>
                    <button className='sidebar-button'>View sessions</button>
                </div>
                <div onClick={() => setMenu("profile")} className={`sidebar-option ${menu === "profile" ? "active" : ""}`}>
                    <button className='sidebar-button'>Manage profile</button>
                </div>
                
            </div>
        </div>
    );
}

export default Sidebar;