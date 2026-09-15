const express = require('express');
const { body, validationResult } = require('express-validator');
const { Gallery } = require('../models/Client');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// ─── GET ALL GALLERY IMAGES (public) ─────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { eventType, featured, page = 1, limit = 24 } = req.query;

    const filter = {};
    if (eventType && eventType !== 'All') filter.eventType = eventType;
    if (featured === 'true') filter.featured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [images, total] = await Promise.all([
      Gallery.find(filter)
        .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-uploadedBy'),
      Gallery.countDocuments(filter)
    ]);

    res.json({
      images,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Get gallery error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery.' });
  }
});

// ─── GET FEATURED IMAGES ──────────────────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const images = await Gallery.find({ featured: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(12)
      .select('imageUrl eventType title tags');
    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured images.' });
  }
});

// ─── INCREMENT VIEW COUNT ─────────────────────────────────────────────────────
router.patch('/:id/view', async (req, res) => {
  try {
    await Gallery.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update view count.' });
  }
});

// ─── ADMIN: UPLOAD IMAGE FILE ────────────────────────────────────────────────
router.post('/upload', verifyToken, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

  const { eventType, title, featured, tags } = req.body;
  if (!eventType) return res.status(400).json({ error: 'Event type required.' });

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/gallery/${req.file.filename}`;

  try {
    const image = await Gallery.create({
      imageUrl,
      thumbnailUrl: imageUrl,
      eventType,
      title: title || '',
      featured: featured === 'true',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      uploadedBy: req.user._id
    });
    res.status(201).json({ message: 'Image uploaded successfully.', image });
  } catch (err) {
    console.error('Upload gallery image error:', err);
    res.status(500).json({ error: 'Failed to save image.' });
  }
});

// ─── ADMIN: ADD IMAGE ─────────────────────────────────────────────────────────
router.post(
  '/',
  verifyToken,
  requireAdmin,
  [
    body('imageUrl').notEmpty().isURL().withMessage('Valid image URL required.'),
    body('eventType').notEmpty().withMessage('Event type required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { imageUrl, thumbnailUrl, eventType, title, description, tags, featured, sortOrder } = req.body;

      const image = await Gallery.create({
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        eventType,
        title,
        description,
        tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
        featured: featured || false,
        sortOrder: sortOrder || 0,
        uploadedBy: req.user._id
      });

      res.status(201).json({ message: 'Image added to gallery.', image });
    } catch (err) {
      console.error('Add gallery image error:', err);
      res.status(500).json({ error: 'Failed to add image.' });
    }
  }
);

// ─── ADMIN: UPDATE IMAGE ──────────────────────────────────────────────────────
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!image) return res.status(404).json({ error: 'Image not found.' });
    res.json({ message: 'Image updated.', image });
  } catch (err) {
    console.error('Update gallery image error:', err);
    res.status(500).json({ error: 'Failed to update image.' });
  }
});

// ─── ADMIN: DELETE IMAGE ──────────────────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found.' });
    res.json({ message: 'Image removed from gallery.' });
  } catch (err) {
    console.error('Delete gallery image error:', err);
    res.status(500).json({ error: 'Failed to delete image.' });
  }
});

// ─── ADMIN: BULK ADD SAMPLE IMAGES (seed) ────────────────────────────────────
router.post('/seed', verifyToken, requireAdmin, async (req, res) => {
  try {
    const existing = await Gallery.countDocuments();
    if (existing > 0) return res.json({ message: 'Gallery already has images.' });

    const sampleImages = [
      { imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', eventType: 'Wedding Reception', title: 'Enchanted Garden Wedding', featured: true, tags: ['floral', 'romantic', 'white'] },
      { imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', eventType: 'Birthday Party', title: 'Glamorous Birthday Bash', featured: true, tags: ['gold', 'balloons', 'birthday'] },
      { imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', eventType: 'Baby Shower', title: 'Sweet Baby Shower', featured: true, tags: ['pastel', 'baby', 'shower'] },
      { imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800', eventType: 'Birthday Party', title: 'Elegant Birthday Celebration', tags: ['rose-gold', 'elegant'] },
      { imageUrl: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=800', eventType: 'Bridal Shower', title: 'Garden Bridal Shower', tags: ['floral', 'bridal', 'garden'] },
      { imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800', eventType: 'Wedding Reception', title: 'Candlelit Reception', featured: true, tags: ['candles', 'romantic', 'gold'] },
      { imageUrl: 'https://images.unsplash.com/photo-1621879775491-13ce3d174ba0?w=800', eventType: 'Corporate Event', title: 'Executive Corporate Gala', tags: ['corporate', 'professional', 'black'] },
      { imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', eventType: 'Corporate Event', title: 'Company Award Night', tags: ['corporate', 'awards'] },
      { imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', eventType: 'Birthday Party', title: 'Sweet 16 Extravaganza', tags: ['sweet16', 'pink', 'glamour'] },
      { imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800', eventType: 'Anniversary', title: 'Golden Anniversary Dinner', featured: true, tags: ['anniversary', 'golden', 'intimate'] },
      { imageUrl: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=800', eventType: 'Graduation Party', title: 'Graduation Celebration', tags: ['graduation', 'milestone'] },
      { imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', eventType: 'Holiday Party', title: 'Holiday Gala', tags: ['holiday', 'festive', 'red'] }
    ];

    await Gallery.insertMany(sampleImages.map((img, i) => ({ ...img, sortOrder: i, thumbnailUrl: img.imageUrl })));
    res.json({ message: `${sampleImages.length} sample images added to gallery.` });
  } catch (err) {
    console.error('Seed gallery error:', err);
    res.status(500).json({ error: 'Failed to seed gallery.' });
  }
});

module.exports = router;
