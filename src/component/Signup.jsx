import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebaseConfig.js"; // Corrected Path
import { doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import './AuthForm.css'; // Import the new CSS

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      // store minimal profile for About page
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        displayName: displayName || '',
        aboutDescription: '',
        photoUrl: '',
        updatedAt: Date.now()
      });
      navigate('/gallery');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <h2>SIGN UP</h2>
          <p>IMAGE BOX</p>
          <form onSubmit={handleSignup}>
            <div className="auth-input-group">
              <span className="icon"><FontAwesomeIcon icon={faUser} /></span>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name" 
                required 
              />
            </div>
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
                placeholder="Password (min. 6 characters)" 
                required 
              />
            </div>
            <div className="auth-input-group">
              <span className="icon"><FontAwesomeIcon icon={faLock} /></span>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm Password" 
                required 
              />
            </div>
            <button type="submit" className="login-now-btn">Sign Up Now</button>
          </form>
        </div>
        <div className="auth-image-section">
          <div className="glass-effect"></div>
          {/* Using a slightly different image for variety */}
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Person working on a laptop" />
        </div>
      </div>
    </div>
  );
}

export default Signup;