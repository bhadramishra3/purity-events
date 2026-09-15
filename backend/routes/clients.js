const express = require('express');
const { body, validationResult } = require('express-validator');
const { Client, VisionBoard, Booking } = require('../models/Client');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── GET MY PROFILE ───────────────────────────────────────────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await Client.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const bookingCount = await Booking.countDocuments({ clientId: req.user._id });
    res.json({ user, bookingCount });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ─── UPDATE MY PROFILE ────────────────────────────────────────────────────────
router.put(
  '/profile',
  verifyToken,
  [
    body('name').optional().notEmpty().trim().withMessage('Name cannot be empty.'),
    body('phone').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, phone, avatar } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (avatar) updates.avatar = avatar;

      const user = await Client.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, select: '-password' }
      );

      res.json({ message: 'Profile updated.', user });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  }
);

// ─── VISION BOARD: CREATE ─────────────────────────────────────────────────────
router.post('/vision-board', verifyToken, async (req, res) => {
  try {
    const {
      bookingId, title, inspirationImages, colors,
      style, notes, eventType, eventDate
    } = req.body;

    const visionBoard = await VisionBoard.create({
      clientId: req.user._id,
      bookingId: bookingId || undefined,
      title: title || 'My Vision Board',
      inspirationImages: inspirationImages || [],
      colors: colors || [],
      style,
      notes,
      eventType,
      eventDate
    });

    // Link to booking if provided
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { visionBoardId: visionBoard._id });
    }

    res.status(201).json({ message: 'Vision board created!', visionBoard });
  } catch (err) {
    console.error('Create vision board error:', err);
    res.status(500).json({ error: 'Failed to create vision board.' });
  }
});

// ─── VISION BOARD: GET MY BOARDS ─────────────────────────────────────────────
router.get('/vision-boards', verifyToken, async (req, res) => {
  try {
    const visionBoards = await VisionBoard.find({ clientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('bookingId', 'eventType eventDate venue bookingStatus');
    res.json({ visionBoards });
  } catch (err) {
    console.error('Get vision boards error:', err);
    res.status(500).json({ error: 'Failed to fetch vision boards.' });
  }
});

// ─── VISION BOARD: GET SINGLE ─────────────────────────────────────────────────
router.get('/vision-board/:id', verifyToken, async (req, res) => {
  try {
    const vb = await VisionBoard.findById(req.params.id)
      .populate('bookingId', 'eventType eventDate venue');

    if (!vb) return res.status(404).json({ error: 'Vision board not found.' });

    if (vb.clientId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ visionBoard: vb });
  } catch (err) {
    console.error('Get vision board error:', err);
    res.status(500).json({ error: 'Failed to fetch vision board.' });
  }
});

// ─── VISION BOARD: UPDATE ─────────────────────────────────────────────────────
router.put('/vision-board/:id', verifyToken, async (req, res) => {
  try {
    const vb = await VisionBoard.findById(req.params.id);
    if (!vb) return res.status(404).json({ error: 'Vision board not found.' });

    if (vb.clientId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const allowedFields = ['title', 'inspirationImages', 'colors', 'style', 'notes', 'eventType', 'eventDate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) vb[field] = req.body[field];
    });

    await vb.save();
    res.json({ message: 'Vision board updated.', visionBoard: vb });
  } catch (err) {
    console.error('Update vision board error:', err);
    res.status(500).json({ error: 'Failed to update vision board.' });
  }
});

// ─── VISION BOARD: DELETE ─────────────────────────────────────────────────────
router.delete('/vision-board/:id', verifyToken, async (req, res) => {
  try {
    const vb = await VisionBoard.findById(req.params.id);
    if (!vb) return res.status(404).json({ error: 'Vision board not found.' });

    if (vb.clientId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await VisionBoard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vision board deleted.' });
  } catch (err) {
    console.error('Delete vision board error:', err);
    res.status(500).json({ error: 'Failed to delete vision board.' });
  }
});

// ─── ADMIN: GET ALL CLIENTS ───────────────────────────────────────────────────
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { isAdmin: false };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [clients, total] = await Promise.all([
      Client.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Client.countDocuments(filter)
    ]);

    // Attach booking counts
    const clientsWithCounts = await Promise.all(
      clients.map(async c => {
        const bookingCount = await Booking.countDocuments({ clientId: c._id });
        return { ...c.toObject(), bookingCount };
      })
    );

    res.json({ clients: clientsWithCounts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ error: 'Failed to fetch clients.' });
  }
});

// ─── ADMIN: GET CLIENT DETAIL ─────────────────────────────────────────────────
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');
    if (!client) return res.status(404).json({ error: 'Client not found.' });

    const bookings = await Booking.find({ clientId: req.params.id }).sort({ createdAt: -1 });
    const visionBoards = await VisionBoard.find({ clientId: req.params.id });

    res.json({ client, bookings, visionBoards });
  } catch (err) {
    console.error('Get client detail error:', err);
    res.status(500).json({ error: 'Failed to fetch client details.' });
  }
});

module.exports = router;
