require('dotenv').config({ encoding: 'utf8' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { atlasConnection, localConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

//  Allow both localhost and your deployed frontend
app.use(cors({
  origin: [
    "https://bharath14-star.github.io",
    "http://localhost:5173"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

//  API routes
app.use('/api/auth', authRoutes);
app.use('/api', carRoutes);

//  Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

//  Connect to MongoDB Atlas always
const atlasPromise = new Promise((resolve, reject) => {
  atlasConnection.once('open', () => {
    console.log(' Connected to MongoDB Atlas');
    resolve();
  });
  atlasConnection.once('error', reject);
});

//  Only connect to local MongoDB if NOT in production
const localPromise = process.env.NODE_ENV !== 'production' && localConnection
  ? new Promise((resolve, reject) => {
      localConnection.once('open', () => {
        console.log(' Connected to local MongoDB');
        resolve();
      });
      localConnection.once('error', reject);
    })
  : Promise.resolve();

Promise.all([atlasPromise, localPromise])
  .then(() => {
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });
