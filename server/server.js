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

// Endpoint to upload an image to Cloudinary
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const cld_upload_stream = cloudinary.uploader.upload_stream(
    { folder: 'photo-gallery' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).send('Upload to Cloudinary failed.');
      }
      res.json({ secure_url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
});

// GET photos for a specific user from Firestore
app.get('/api/photos/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const photosRef = db.collection('photos');
    const snapshot = await photosRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    
    if (snapshot.empty) return res.json([]);
    
    let photos = [];
    snapshot.forEach(doc => photos.push({ id: doc.id, ...doc.data() }));
    res.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).send('Error fetching photos data.');
  }
});

// POST a new photo's details to Firestore
app.post('/api/photos', async (req, res) => {
  try {
    const { userId, title, description, src } = req.body;
    const newPhoto = {
      userId,
      title,
      description,
      src,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('photos').add(newPhoto);
    res.status(201).json({ id: docRef.id, ...newPhoto });
  } catch (error) {
    console.error("Error saving photo:", error);
    res.status(500).send('Error saving photo details.');
  }
});

// Resolve email by user name using Admin SDK (bypasses client rules)
// removed /api/resolve-email endpoint

// DELETE a photo from Firestore
app.delete('/api/photos/:photoId', async (req, res) => {
  try {
    const photoId = req.params.photoId;
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