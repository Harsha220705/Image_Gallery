const express = require('express');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');
const streamifier = require('streamifier');
require('dotenv').config();

// --- CONFIGURATIONS ---

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });


// --- API ROUTES ---

// This endpoint handles uploading image files to Cloudinary (image hosting service)
// When a user uploads a photo, this saves it to the cloud and returns a permanent URL
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  // Upload the image to Cloudinary and get back a permanent URL
  const cld_upload_stream = cloudinary.uploader.upload_stream(
    { folder: 'photo-gallery' }, // Organize images in a folder called 'photo-gallery'
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).send('Upload to Cloudinary failed.');
      }
      res.json({ secure_url: result.secure_url }); // Send back the permanent URL
    }
  );

  // Stream the uploaded file directly to Cloudinary
  streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
});

// This endpoint retrieves all photos that belong to a specific user from the database
// It's called when a user logs in to show their personal photo gallery
app.get('/api/photos/:userId', async (req, res) => {
  try {
    const userId = req.params.userId; // Get the user ID from the URL
    const photosRef = db.collection('photos');
    // Find all photos where the userId matches, sorted by newest first
    const snapshot = await photosRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    
    if (snapshot.empty) return res.json([]); // Return empty array if no photos found
    
    let photos = [];
    // Convert Firestore documents to regular JavaScript objects
    snapshot.forEach(doc => photos.push({ id: doc.id, ...doc.data() }));
    res.json(photos); // Send back the array of photos
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).send('Error fetching photos data.');
  }
});

// This endpoint saves a new photo's details to the database after the image has been uploaded
// It stores the title, description, image URL, and user ID in Firestore
app.post('/api/photos', async (req, res) => {
  try {
    const { userId, title, description, src, location } = req.body; // Get photo data from the request
    const newPhoto = {
      userId, // Which user owns this photo
      title, // Photo title
      description, // Photo description
      src, // The permanent URL where the image is stored
      location: location || null, // Optional lat/lng provided by client
      createdAt: admin.firestore.FieldValue.serverTimestamp() // When this photo was created
    };
    // Save the photo to the 'photos' collection in Firestore
    const docRef = await db.collection('photos').add(newPhoto);
    res.status(201).json({ id: docRef.id, ...newPhoto }); // Send back the saved photo with its database ID
  } catch (error) {
    console.error("Error saving photo:", error);
    res.status(500).send('Error saving photo details.');
  }
});

// Resolve email by user name using Admin SDK (bypasses client rules)
// removed /api/resolve-email endpoint

// This endpoint permanently deletes a photo from the database
// It's called when a user clicks the delete button on a photo
app.delete('/api/photos/:photoId', async (req, res) => {
  try {
    const photoId = req.params.photoId; // Get the photo ID from the URL
    // Delete the photo document from the 'photos' collection in Firestore
    await db.collection('photos').doc(photoId).delete();
    res.status(200).send('Photo deleted successfully.');
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).send('Error deleting photo.');
  }
});


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});