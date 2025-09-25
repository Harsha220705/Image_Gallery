import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Corrected Path
import './header.css';

// 1. Accept 'user' as a prop
function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">PhotoGallery</Link>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/gallery">Gallery</Link>
          {/* <Link to="/about">About</Link> */}
        </nav>
      </div>
      <div className="header-right">
        {/* 2. Conditional Rendering */}
        {user ? (
          <>
            <span className="user-email">{user.displayName || user.email}</span>
            <Link to="/addphoto" className="nav-link">Add Photo</Link>
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-button">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;