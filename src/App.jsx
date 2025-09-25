import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// --- Component Imports ---
import Home from './component/Home';
import Gallery from './component/Gallery.jsx';
import AddPhoto from './component/AddPhoto.jsx';
import Login from './component/Login.jsx';
import Signup from './component/Signup.jsx';
import Header from './component/Header.jsx';
import About from './component/About.jsx';
import ContactUs from './component/ContactUs.jsx';
import FileNotFound from './component/FileNotFound.jsx';
import './component/style.css';

// --- Configuration ---
// Use environment variable for the backend URL, with a fallback for local development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

function App() {
  // --- State Management ---
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null); // Stores the logged-in user object or null
  const [isLoading, setIsLoading] = useState(false); // For data loading states
  const [isAuthLoading, setIsAuthLoading] = useState(true); // For the initial auth check

  // --- Effects ---

  // Effect to listen for changes in Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false); // Auth check is complete
    });
    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Effect to fetch photos from the backend whenever the user logs in or out
  useEffect(() => {
    if (user) { // Only fetch photos if a user is logged in
      setIsLoading(true);
      const fetchPhotos = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/photos/${user.uid}`);
          if (!response.ok) throw new Error('Failed to fetch photos.');
          const photosData = await response.json();
          setPhotos(photosData);
        } catch (error) {
          console.error('Error fetching photos:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPhotos();
    } else {
      setPhotos([]); // Clear photos when the user logs out
    }
  }, [user]); // This effect re-runs whenever the 'user' state changes

  // --- Data Handling Functions ---

  // Function to add a new photo
  const handleAddPhoto = async (newPhotoData) => {
    if (!user) return; // Guard clause
    
    // Add the user's ID to the photo data before sending to the backend
    const photoToSend = { ...newPhotoData, userId: user.uid };

    try {
      const response = await fetch(`${BACKEND_URL}/api/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoToSend),
      });
      const savedPhoto = await response.json();
      // Add the new photo to the top of the list in the UI for immediate feedback
      setPhotos(prevPhotos => [savedPhoto, ...prevPhotos]);
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  // Function to delete a photo
  const handleDeletePhoto = async (photoIdToDelete) => {
    try {
      await fetch(`${BACKEND_URL}/api/photos/${photoIdToDelete}`, {
        method: 'DELETE',
      });
      // Update the UI by removing the deleted photo from the state
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoIdToDelete));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };
  
  // --- Render Logic ---

  // Show a global loading message while checking for a logged-in user
  if (isAuthLoading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Application...</p>;
  }

  return (
    <Router>
      <div className="app-container">
        <Header user={user} />
        <main className="content-area">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Home photos={photos} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* --- Protected Routes (Redirect to /login if no user) --- */}
            <Route 
              path="/gallery" 
              element={user ? <Gallery photos={photos} onDeletePhoto={handleDeletePhoto} isLoading={isLoading} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/addphoto" 
              element={user ? <AddPhoto onAddPhoto={handleAddPhoto} backendUrl={BACKEND_URL} /> : <Navigate to="/login" />} 
            />
            
            {/* --- 404 Not Found Route --- */}
            <Route path="/*" element={<FileNotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
