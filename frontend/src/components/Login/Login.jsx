import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSSOLogin = () => {
    alert("Chức năng đang phát triển: Chuyển hướng sang HCMUT SSO...");
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Dang nhap thanh cong!');
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Khong the ket noi den server');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmail('');
    setPassword('');
    setError('');
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
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Email (vd: user001@hcmut.edu.vn)" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Dang dang nhap...' : 'Login'}
            </button>
            <button type="button" className="btn-clear" onClick={handleClear}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
