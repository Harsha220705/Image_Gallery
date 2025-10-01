
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

// Firebase project configuration - contains all the connection details needed to connect to our Firebase project
// This tells Firebase which project to connect to and provides authentication keys
const firebaseConfig = {
  apiKey: "AIzaSyBErvKqhQlYubRN4Oh5SeoVR1L1lAJKOgs",
  authDomain: "image-gallery-b410c.firebaseapp.com",
  projectId: "image-gallery-b410c",
  storageBucket: "image-gallery-b410c.firebasestorage.app",
  messagingSenderId: "911455660552",
  appId: "1:911455660552:web:8de0e8b834112329af7fbd",
  measurementId: "G-EMH8EEMMM6"
};

// Creates the main Firebase app instance using our configuration
// This is like connecting to Firebase with our project credentials
const app = initializeApp(firebaseConfig);

// Creates and exports the authentication service - handles user login, signup, logout
// This is what we use to manage user accounts and check if someone is logged in
export const auth = getAuth(app);

// Creates and exports the Firestore database service - handles storing and retrieving data
// This is what we use to save photos, user data, and other information to the cloud database
export const db = getFirestore(app);