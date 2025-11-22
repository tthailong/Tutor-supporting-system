import React, { useState } from 'react';
import './Login.css';
import logo from '../../assets/logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSSOLogin = () => {
    alert("Chức năng đang phát triển: Chuyển hướng sang HCMUT SSO...");
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    console.log("Admin Login:", { username, password });
    alert(`Đang thử đăng nhập Admin với User: ${username}`);
  };

  const handleClear = () => {
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section">
          <img src={logo} alt="BK Logo" className="bk-logo" />
        </div>

        <h3 className="login-title">Log in using your account on:</h3>

        <button className="btn-sso" onClick={handleSSOLogin}>
          Tài khoản HCMUT (HCMUT Account)
        </button>

        <div className="divider">
          <span>OR (Admin Only)</span>
        </div>

        <form onSubmit={handleAdminLogin} className="admin-form">
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-login">Login</button>
            <button type="button" className="btn-clear" onClick={handleClear}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
