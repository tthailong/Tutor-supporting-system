import React from 'react';
import './Optionlist.css';
import { FaUniversalAccess, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Optionlist = () => {
  const navigate = useNavigate();

  return (
    <div className="option-list-container">
      <h2 className="option-heading">Choose an option:</h2>
      <div className="options-wrapper">
        <div className="option-card" onClick={() => navigate('manual')}>
          <div className="icon-wrapper">
            <FaUniversalAccess className="option-icon" />
          </div>
          <span className="option-label">Manual</span>
        </div>
        <div className="option-card" onClick={() => navigate('auto')}>
          <div className="icon-wrapper">
            <FaCog className="option-icon" />
          </div>
          <span className="option-label">Automatic</span>
        </div>
      </div>
    </div>
  );
};

export default Optionlist;
