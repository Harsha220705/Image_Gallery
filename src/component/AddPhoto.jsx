import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./style.css"; // Or AuthForm.css if you're using that
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const AddPhoto = ({ onAddPhoto }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !imageFile) {
      alert("Please fill in all fields.");
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      // Step 1: Upload image to your backend to get a Cloudinary URL
      const uploadUrl = `${BACKEND_URL}/api/upload`;
      console.log("Attempting to upload to:", uploadUrl);
      console.log("Sending this form data:", formData);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Image upload failed.');

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url;

      // Step 2: Create the photo data object WITHOUT the user ID
      const newPhotoData = {
        title: title,
        description: description,
        src: imageUrl,
        id: Date.now(), // A temporary ID for the frontend state
      };

      // Step 3: Pass this data up to App.jsx to handle saving to Firestore
      onAddPhoto(newPhotoData);
      
      navigate('/gallery');

    } catch (error) {
      console.error(error);
      alert("There was an error uploading the photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Add a New Photo</h2>
      <form onSubmit={handleSubmit}>
        {/* Your input fields for title, description, and file */}
        {/* ... (make sure they are correctly updating state with onChange) ... */}
        <div className="mb-3">
            <label htmlFor="photoTitle" className="form-label">Photo Title</label>
            <input type="text" className="form-control" id="photoTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="mb-3">
            <label htmlFor="photoDescription" className="form-label">Photo Description</label>
            <input type="text" className="form-control" id="photoDescription" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mb-3">
            <label htmlFor="photoFile" className="form-label">Upload Image</label>
            <input type="file" className="form-control" id="photoFile" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Add Photo'}
        </button>
      </form>
    </div>
  );
};

export default AddPhoto;