// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// 1. Change this line: Import getAuth instead of getAnalytics
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (this part is correct)
const firebaseConfig = {
  apiKey: "AIzaSyBErvKqhQlYubRN4Oh5SeoVR1L1lAJKOgs",
  authDomain: "image-gallery-b410c.firebaseapp.com",
  projectId: "image-gallery-b410c",
  storageBucket: "image-gallery-b410c.firebasestorage.app",
  messagingSenderId: "911455660552",
  appId: "1:911455660552:web:8de0e8b834112329af7fbd",
  measurementId: "G-EMH8EEMMM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Change this line: Initialize and EXPORT auth
export const auth = getAuth(app);
export const db = getFirestore(app);