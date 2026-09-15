const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { Client } = require('../models/Client');
const { signToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
// Frontend sends Google credential (ID token) → backend verifies with Google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required.' });

    // Verify Google ID token via tokeninfo endpoint
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const { sub: googleId, email, name, picture, aud } = response.data;

    // Validate the audience matches our client ID
    if (aud !== process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
      return res.status(401).json({ error: 'Invalid Google token audience.' });
    }

    // Find or create user
    let user = await Client.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await Client.create({
        googleId,
        email,
        name,
        avatar: picture,
        lastLogin: new Date()
      });
    } else {
      // Update existing user with Google info
      if (!user.googleId) user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Google auth error:', err.response?.data || err.message);
    res.status(401).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// ─── FACEBOOK OAUTH ───────────────────────────────────────────────────────────
// Frontend sends Facebook access token → backend verifies with Graph API
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    if (!accessToken || !userID) {
      return res.status(400).json({ error: 'Facebook access token and userID required.' });
    }

    // Verify token with Facebook Graph API
    const fbResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${userID}?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );
    const { id: facebookId, name, email, picture } = fbResponse.data;

    if (facebookId !== userID) {
      return res.status(401).json({ error: 'Facebook token mismatch.' });
    }

    const avatarUrl = picture?.data?.url;
    const userEmail = email || `fb_${facebookId}@purityevents.placeholder`;

    let user = await Client.findOne({
      $or: [{ facebookId }, ...(email ? [{ email }] : [])]
    });

    if (!user) {
      user = await Client.create({
        facebookId,
        email: userEmail,
        name,
        avatar: avatarUrl,
        lastLogin: new Date()
      });
    } else {
      if (!user.facebookId) user.facebookId = facebookId;
      if (avatarUrl && !user.avatar) user.avatar = avatarUrl;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Facebook auth error:', err.response?.data || err.message);
    res.status(401).json({ error: 'Facebook authentication failed. Please try again.' });
  }
});

// ─── ADMIN LOGIN (email/password) ─────────────────────────────────────────────
router.post(
  '/admin/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await Client.findOne({ email, isAdmin: true }).select('+password');

      if (!user) return res.status(401).json({ error: 'Invalid admin credentials.' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid admin credentials.' });

      user.lastLogin = new Date();
      await user.save();

      const token = signToken(user);
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isAdmin: user.isAdmin
        }
      });
    } catch (err) {
      console.error('Admin login error:', err);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  }
);

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      phone: req.user.phone,
      isAdmin: req.user.isAdmin
    }
  });
});

// ─── SEED ADMIN (run once, then disable) ─────────────────────────────────────
router.post('/seed-admin', async (req, res) => {
  try {
    const existing = await Client.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) return res.json({ message: 'Admin already exists.' });

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'PurityAdmin2024!', 12);
    await Client.create({
      email: process.env.ADMIN_EMAIL || 'admin@purityevents.com',
      name: 'Purity Events Admin',
      password: hashedPassword,
      isAdmin: true
    });
    res.json({ message: 'Admin account created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
