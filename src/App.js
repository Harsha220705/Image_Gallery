import React, { useState } from 'react'; // Make sure to import useState
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your components
import Header from './component/Header.jsx';
import Home from './component/Home';
import About from './component/About.jsx';
import ContactUs from './component/ContactUs.jsx';
import FileNotFound from './component/FileNotFound.jsx';
import Gallery from './component/Gallery.jsx';
import AddPhoto from './component/AddPhoto.jsx';
import Login from './component/Login.jsx';
import Signup from './component/Signup.jsx';

import './component/style.css';

// Let's create an initial list of photos based on your old Gallery
const initialPhotos = [
  {
    id: 1,
    src: "https://cdn.pixabay.com/photo/2021/04/01/15/37/copyright-6142591_1280.jpg",
    title: "Copyright",
    description: "A creative take on copyright.",
  },
  {
    id: 2,
    src: "https://cdn.pixabay.com/photo/2017/10/06/01/52/fire-2821775_1280.jpg",
    title: "Fire",
    description: "A mesmerizing campfire.",
  },
  {
    id: 3,
    src: "https://cdn.pixabay.com/photo/2018/01/22/17/43/chess-3099499_1280.jpg",
    title: "Chess",
    description: "A game of strategy.",
  }
];

function App() {
  // 1. Create the state for photos here
  const [photos, setPhotos] = useState(initialPhotos);

  // 2. Create the function that will add a new photo
  const handleAddPhoto = (newPhoto) => {
    // Add the new photo to the beginning of the existing array
    setPhotos([newPhoto, ...photos]);
  };

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="content-area">
          <Routes>
            {/* 3. Pass the state and function down as props */}
            <Route path='/gallery' element={<Gallery photos={photos} />} />
            <Route path='/addphoto' element={<AddPhoto onAddPhoto={handleAddPhoto} />} />

            {/* Other routes */}
            <Route path='/' element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={<FileNotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;