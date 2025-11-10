const mongoose = require('mongoose');
const { atlasConnection, localConnection } = require('../config/database');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  name: { type: String, required: true }, // Keep for backward compatibility
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Create models for both connections
const UserAtlas = atlasConnection.model('User', userSchema);
const UserLocal = localConnection.model('User', userSchema);

module.exports = { UserAtlas, UserLocal };
