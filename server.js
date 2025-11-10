require('dotenv').config({ encoding: 'utf8' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { atlasConnection, localConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors("https://bharath14-star.github.io/car_portal/"));
app.use(cors("http://localhost:5173"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api', carRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Wait for both connections to be established
Promise.all([
  new Promise((resolve, reject) => {
    atlasConnection.once('open', () => {
      console.log('Connected to MongoDB Atlas');
      resolve();
    });
    atlasConnection.once('error', reject);
  }),
  new Promise((resolve, reject) => {
    localConnection.once('open', () => {
      console.log('Connected to local MongoDB');
      resolve();
    });
    localConnection.once('error', reject);
  })
]).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
