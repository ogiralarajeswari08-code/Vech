// ✅ Import models safely
let UserAtlas, UserLocal;
try {
  const models = require('../models/User');
  UserAtlas = models.UserAtlas;
  UserLocal = models.UserLocal || null; // handle missing local model
} catch (err) {
  console.error('⚠️ Failed to load user models:', err.message);
  UserAtlas = null;
  UserLocal = null;
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

// ====================== REGISTER ======================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword)
      return res.status(400).json({ message: 'All fields are required' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const exists = await UserAtlas.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`;

    // ✅ Always save to Atlas
    const userAtlas = await UserAtlas.create({
      firstName,
      lastName,
      name,
      email,
      phone,
      password: hash,
    });

    // ✅ Try to save to Local DB (only in dev)
    if (UserLocal) {
      try {
        await UserLocal.create({
          firstName,
          lastName,
          name,
          email,
          phone,
          password: hash,
        });
        console.log('🗂️ User also stored in local MongoDB');
      } catch (err) {
        console.warn('⚠️ Local DB save failed:', err.message);
      }
    }

    // ✅ Create token
    const token = jwt.sign(
      { id: userAtlas._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: userAtlas._id,
        name: userAtlas.name,
        email: userAtlas.email,
        role: userAtlas.role,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== LOGIN ======================
exports.login = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;
    const user = await UserAtlas.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Verify role
    if (user.role !== loginType)
      return res.status(403).json({
        message: `You are not authorized to login as ${loginType}`,
      });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== FORGOT PASSWORD ======================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await UserAtlas.findOne({ email });
    if (!user)
      return res.status(400).json({
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    const resetLink = `${
      process.env.FRONTEND_URL || 'http://localhost:5174'
    }/reset-password?token=${resetToken}`;

    try {
      await sendEmail(
        email,
        'Password Reset Request',
        `Click the link to reset your password: ${resetLink}`,
        `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== VERIFY TOKEN ======================
exports.verify = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
