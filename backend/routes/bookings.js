const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Booking } = require('../models/Client');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── VALIDATION RULES ─────────────────────────────────────────────────────────
const bookingValidation = [
  body('eventType').notEmpty().withMessage('Event type is required.'),
  body('eventDate').isISO8601().withMessage('Valid event date is required.'),
  body('venue').notEmpty().trim().withMessage('Venue is required.'),
  body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be at least 1.'),
  body('budgetMin').optional().isNumeric().withMessage('Budget minimum must be a number.'),
  body('budgetMax').optional().isNumeric().withMessage('Budget maximum must be a number.')
];

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
router.post('/', verifyToken, bookingValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const {
      eventType, eventDate, eventTime, venue, venueAddress,
      guestCount, selectedPackage, selectedFeatures,
      tableCount, tableCenterpieces, budgetMin, budgetMax,
      specialRequests, colorTheme
    } = req.body;

    const booking = await Booking.create({
      clientId: req.user._id,
      clientName: req.user.name,
      clientEmail: req.user.email,
      clientPhone: req.user.phone,
      eventType, eventDate, eventTime,
      venue, venueAddress, guestCount,
      selectedPackage, selectedFeatures,
      tableCount, tableCenterpieces,
      budgetMin, budgetMax,
      specialRequests, colorTheme,
      bookingStatus: 'Pending'
    });

    res.status(201).json({ message: 'Booking submitted successfully!', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// ─── GET MY BOOKINGS ──────────────────────────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ clientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('visionBoardId', 'title colors style');

    res.json({ bookings });
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// ─── GET SINGLE BOOKING ───────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('visionBoardId');

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Only client who owns it or admin can view
    if (booking.clientId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ booking });
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ error: 'Failed to fetch booking.' });
  }
});

// ─── UPDATE BOOKING (client can update pending bookings) ─────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Clients can only update their own pending bookings
    if (!req.user.isAdmin) {
      if (booking.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      if (booking.bookingStatus !== 'Pending') {
        return res.status(400).json({ error: 'Only pending bookings can be modified.' });
      }
    }

    const allowedFields = [
      'eventDate', 'eventTime', 'venue', 'venueAddress', 'guestCount',
      'selectedPackage', 'selectedFeatures', 'tableCount', 'tableCenterpieces',
      'budgetMin', 'budgetMax', 'specialRequests', 'colorTheme'
    ];

    // Admin can also update these fields
    if (req.user.isAdmin) {
      allowedFields.push('bookingStatus', 'depositAmount', 'depositPaid', 'adminNotes', 'totalAmount', 'paymentStatus');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    await booking.save();
    res.json({ message: 'Booking updated successfully.', booking });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    if (!req.user.isAdmin && booking.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking.' });
    }

    booking.bookingStatus = 'Cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled.', booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// ─── ADMIN: GET ALL BOOKINGS ──────────────────────────────────────────────────
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      status, eventType, page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.bookingStatus = status;
    if (eventType) filter.eventType = eventType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('clientId', 'name email phone avatar'),
      Booking.countDocuments(filter)
    ]);

    res.json({
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// ─── ADMIN: STATS ─────────────────────────────────────────────────────────────
router.get('/admin/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled, revenue] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'Pending' }),
      Booking.countDocuments({ bookingStatus: 'Confirmed' }),
      Booking.countDocuments({ bookingStatus: 'Completed' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' }),
      Booking.aggregate([
        { $match: { bookingStatus: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Bookings by event type
    const byEventType = await Booking.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent bookings (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recent = await Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      total, pending, confirmed, completed, cancelled,
      totalRevenue: revenue[0]?.total || 0,
      byEventType,
      recentBookings: recent
    });
  } catch (err) {
    console.error('Booking stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─── ADMIN: DELETE BOOKING ────────────────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

module.exports = router;
