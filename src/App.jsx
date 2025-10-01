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

  // This effect runs once when the app starts and sets up a listener for authentication changes
  // It automatically detects when a user logs in or out and updates our app state accordingly
  // This means users stay logged in even if they refresh the page or close the browser
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // currentUser will be null if no one is logged in, or contain user info if someone is logged in
      setIsAuthLoading(false); // We're done checking if someone is logged in
    });
    // Cleanup the listener when the component unmounts to prevent memory leaks
    return () => unsubscribe();
  }, []);

  // This effect automatically loads the user's photos when they log in and clears them when they log out
  // It runs every time the 'user' state changes (login, logout, or page refresh)
  useEffect(() => {
    if (user) { // Only try to fetch photos if someone is actually logged in
      setIsLoading(true); // Show loading spinner while we get the photos
      const fetchPhotos = async () => {
        try {
          // Ask our backend server to get all photos that belong to this specific user
          const response = await fetch(`${BACKEND_URL}/api/photos/${user.uid}`);
          if (!response.ok) throw new Error('Failed to fetch photos.');
          const photosData = await response.json();
          setPhotos(photosData); // Store the photos in our app state so we can display them
        } catch (error) {
          console.error('Error fetching photos:', error);
        } finally {
          setIsLoading(false); // Hide loading spinner whether we succeeded or failed
        }
      };
      fetchPhotos();
    } else {
      setPhotos([]); // When user logs out, clear all photos from the screen
    }
  }, [user]); // This effect re-runs whenever the 'user' state changes

  // --- Data Handling Functions ---

  // This function saves a new photo to the database and immediately shows it in the gallery
  // It's called when a user uploads a photo through the AddPhoto form
  const handleAddPhoto = async (newPhotoData) => {
    if (!user) return; // Safety check - don't try to save photos if no one is logged in
    
    // Add the current user's ID to the photo data so we know who owns this photo
    const photoToSend = { ...newPhotoData, userId: user.uid };

    try {
      // Send the photo data to our backend server to save it in the database
      const response = await fetch(`${BACKEND_URL}/api/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoToSend),
      });
      const savedPhoto = await response.json();
      // Immediately add the new photo to the top of our photo list so the user sees it right away
      // This gives instant feedback instead of making them wait for a page refresh
      setPhotos(prevPhotos => [savedPhoto, ...prevPhotos]);
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  // This function permanently deletes a photo from the database and removes it from the gallery
  // It's called when a user clicks the delete button on a photo
  const handleDeletePhoto = async (photoIdToDelete) => {
    try {
      // Tell our backend server to delete this specific photo from the database
      await fetch(`${BACKEND_URL}/api/photos/${photoIdToDelete}`, {
        method: 'DELETE',
      });
      // Immediately remove the photo from our photo list so it disappears from the screen
      // This gives instant feedback instead of making the user wait for a page refresh
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
