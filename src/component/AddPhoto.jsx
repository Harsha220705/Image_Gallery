import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./style.css"; // Or AuthForm.css if you're using that
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const AddPhoto = ({ onAddPhoto }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [blurScore, setBlurScore] = useState(null);
  const [applySharpen, setApplySharpen] = useState(false);
  const [geo, setGeo] = useState({ lat: null, lng: null, error: null });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Acquire location once the component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo(g => ({ ...g, error: 'Geolocation not supported' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null }),
      (err) => setGeo(g => ({ ...g, error: err.message }))
    );
  }, []);

  // Utility: compute variance of Laplacian (focus measure)
  const computeBlurScore = (imageEl) => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = Math.min(512, imageEl.naturalWidth || imageEl.width);
    const scale = width / (imageEl.naturalWidth || imageEl.width);
    const height = Math.round((imageEl.naturalHeight || imageEl.height) * scale);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageEl, 0, 0, width, height);
    const img = ctx.getImageData(0, 0, width, height);
    // Convert to grayscale
    const gray = new Float32Array(width * height);
    for (let i = 0, j = 0; i < img.data.length; i += 4, j++) {
      const r = img.data[i];
      const g = img.data[i + 1];
      const b = img.data[i + 2];
      gray[j] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    // 3x3 Laplacian kernel
    const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
    const out = new Float32Array(width * height);
    let sum = 0;
    let sumSq = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        let val = 0;
        val += gray[idx - width] * kernel[1];
        val += gray[idx - 1] * kernel[3];
        val += gray[idx] * kernel[4];
        val += gray[idx + 1] * kernel[5];
        val += gray[idx + width] * kernel[7];
        out[idx] = val;
        sum += val;
        sumSq += val * val;
      }
    }
    const n = (width - 2) * (height - 2);
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    return variance;
  };

  // Utility: apply basic unsharp mask to reduce perceived blur
  const getProcessedBlob = async (imageEl, sharpen) => {
    if (!sharpen) {
      return imageFile;
    }
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = imageEl.naturalWidth || imageEl.width;
    const height = imageEl.naturalHeight || imageEl.height;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageEl, 0, 0, width, height);
    // Simple sharpening convolution
    ctx.filter = 'none';
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = 3;
    const halfSide = Math.floor(side / 2);
    const src = ctx.getImageData(0, 0, width, height);
    const dst = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = dst.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let ky = 0; ky < side; ky++) {
          for (let kx = 0; kx < side; kx++) {
            const scy = Math.min(height - 1, Math.max(0, y + ky - halfSide));
            const scx = Math.min(width - 1, Math.max(0, x + kx - halfSide));
            const srcOff = (scy * width + scx) * 4;
            const wt = weights[ky * side + kx];
            r += srcData[srcOff] * wt;
            g += srcData[srcOff + 1] * wt;
            b += srcData[srcOff + 2] * wt;
            a += srcData[srcOff + 3] * wt;
          }
        }
        const dstOff = (y * width + x) * 4;
        dstData[dstOff] = Math.max(0, Math.min(255, r));
        dstData[dstOff + 1] = Math.max(0, Math.min(255, g));
        dstData[dstOff + 2] = Math.max(0, Math.min(255, b));
        dstData[dstOff + 3] = Math.max(0, Math.min(255, a));
      }
    }
    ctx.putImageData(dst, 0, 0);
    return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), imageFile.type || 'image/jpeg', 0.92));
  };

  // This function handles the entire photo upload process when a user submits the form
  // It uploads the image file to Cloudinary (image hosting service) and then saves the photo details to our database
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    if (!title || !description || !imageFile) {
      alert("Please fill in all fields.");
      return;
    }
    // If image seems blurred, confirm
    if (isBlurred && !applySharpen) {
      const proceed = confirm('The image looks a bit blurry. Do you still want to upload?');
      if (!proceed) return;
    }
    setIsLoading(true); // Show loading spinner while uploading

    const formData = new FormData();
    try {
      // Optionally process image (sharpen) before upload
      let uploadBlob = await getProcessedBlob(imgRef.current, applySharpen);
      const uploadFile = uploadBlob instanceof Blob ? new File([uploadBlob], imageFile.name, { type: imageFile.type }) : imageFile;
      formData.append('image', uploadFile); // Prepare the image file for upload

      // Step 1: Upload image to Cloudinary (image hosting service) to get a permanent URL
      const uploadUrl = `${BACKEND_URL}/api/upload`;
      console.log("Attempting to upload to:", uploadUrl);
      console.log("Sending this form data:", formData);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Image upload failed.');

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url; // This is the permanent URL where our image is stored

      // Step 2: Create the photo data object with title, description, and the image URL
      const newPhotoData = {
        title: title,
        description: description,
        src: imageUrl,
        location: geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng } : null,
        id: Date.now(), // A temporary ID for the frontend state
      };

      // Step 3: Send this data to the main App component to save it in the database
      onAddPhoto(newPhotoData);
      
      navigate('/gallery'); // Redirect to gallery to see the new photo

    } catch (error) {
      console.error(error);
      alert("There was an error uploading the photo. Please try again.");
    } finally {
      setIsLoading(false); // Hide loading spinner whether upload succeeded or failed
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
            <input type="file" className="form-control" id="photoFile" accept="image/*" onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              setImageFile(file || null);
              if (file) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                // Defer measuring until image element loads
                setTimeout(() => {
                  const imgElement = imgRef.current;
                  if (imgElement && imgElement.complete) {
                    const score = computeBlurScore(imgElement);
                    setBlurScore(score);
                    setIsBlurred(score < 50); // heuristic threshold
                  }
                }, 50);
              } else {
                setPreviewUrl('');
                setIsBlurred(false);
                setBlurScore(null);
              }
            }} />
        </div>
        {previewUrl && (
          <div className="mb-3">
            <div className="mb-2" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>Preview</strong>
              {blurScore !== null && (
                <span className={isBlurred ? 'text-warning' : 'text-success'}>
                  {isBlurred ? 'Image may be blurry' : 'Image looks sharp'} (score: {Math.round(blurScore)})
                </span>
              )}
            </div>
            <img ref={imgRef} src={previewUrl} alt="preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onLoad={(e) => {
              const score = computeBlurScore(e.currentTarget);
              setBlurScore(score);
              setIsBlurred(score < 50);
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="form-check mt-2">
              <input className="form-check-input" type="checkbox" id="applySharpen" checked={applySharpen} onChange={(e) => setApplySharpen(e.target.checked)} />
              <label className="form-check-label" htmlFor="applySharpen">
                Try to reduce blur before upload (client-side sharpen)
              </label>
            </div>
          </div>
        )}
        <div className="mb-3">
          <small className="text-muted">
            {geo.lat && geo.lng ? `Location ready: ${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}` : (geo.error ? `Location unavailable: ${geo.error}` : 'Getting location...')}
          </small>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Add Photo'}
        </button>
      </form>
    </div>
  );
};

export default AddPhoto;