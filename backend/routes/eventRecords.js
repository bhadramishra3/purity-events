const express = require('express');
const router = express.Router();
const EventRecord = require('../models/EventRecord');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All routes are admin-only
router.use(verifyToken, requireAdmin);

// GET all records sorted by sortOrder then date
router.get('/', async (req, res) => {
  try {
    const records = await EventRecord.find().sort({ sortOrder: 1, eventDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch records.' });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { eventName, clientName, eventDate, eventType, decorType, venue,
            guestCount, durationHours, amountCharged, expenses, notes } = req.body;
    if (!eventName) return res.status(400).json({ error: 'Event name is required.' });

    const count = await EventRecord.countDocuments();
    const record = await EventRecord.create({
      eventName, clientName, eventDate, eventType, decorType, venue,
      guestCount, durationHours, amountCharged, expenses, notes,
      sortOrder: count
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create record.' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const record = await EventRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ error: 'Record not found.' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update record.' });
  }
});

// PATCH reorder — body: [{ id, sortOrder }, ...]
router.patch('/reorder', async (req, res) => {
  try {
    const updates = req.body;
    await Promise.all(updates.map(({ id, sortOrder }) =>
      EventRecord.findByIdAndUpdate(id, { sortOrder })
    ));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder.' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await EventRecord.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record.' });
  }
});

module.exports = router;
