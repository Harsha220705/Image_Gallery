import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import './AuthForm.css'; // Import the new CSS

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/gallery');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <h2>LOGIN</h2>
          <p>IMAGE BOX</p>
          <form onSubmit={handleLogin}>
            <div className="auth-input-group">
              <span className="icon"><FontAwesomeIcon icon={faUser} /></span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email" 
                required 
              />
            </div>
            <div className="auth-input-group">
              <span className="icon"><FontAwesomeIcon icon={faLock} /></span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                required 
              />
            </div>
            <button type="submit" className="login-now-btn">Login Now</button>
          </form>
        </div>
        <div className="auth-image-section">
          <div className="glass-effect"></div>
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Person using a tablet" />
        </div>
      </div>
    </div>
  );
}

export default Login;

// Note: You'll need to install font-awesome
// npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome