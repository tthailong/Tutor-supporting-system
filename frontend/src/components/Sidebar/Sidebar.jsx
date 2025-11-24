import React, { useState } from 'react';
import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    return (
        <div className='sidebar'>
            <div className="sidebar-options">
                <Link
                    to='/tutoractivities'
                    className={`sidebar-option ${location.pathname === "/tutoractivities" ? "active" : ""}`}
                >
                    <div className='sidebar-button'>Set availability</div>
                </Link>
                <Link
                    to='/tutorsessions'
                    className={`sidebar-option ${location.pathname === "/tutorsessions" ? "active" : ""}`}
                >
                    <div className='sidebar-button'>View sessions</div>
                </Link>
                <Link
                    to='/tutormatching'
                    className={`sidebar-option ${location.pathname === "/tutormatching" ? "active" : ""}`}
                >
                    <div className='sidebar-button'>Match tutor</div>
                </Link>
                <Link
                    to='/'
                    className={`sidebar-option ${location.pathname === "/" ? "active" : ""}`}> {/*dummy code*/}
                    <div className='sidebar-button'>Manage profile</div>
                </Link>
            </div>
        </div>
    );
}

export default Sidebar;