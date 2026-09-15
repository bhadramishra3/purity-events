/**
 * Run once to load your real event photos into the gallery.
 * Usage: node seedMyPhotos.js
 * Requires MongoDB to be running and MONGODB_URI set in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { Gallery } = require('./models/Client');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

const myPhotos = [
  {
    filename: 'IMG_2025.jpg',
    title: 'Red Rose Ceremony Arch',
    description: 'Outdoor pavilion dressed with red draping and a lush red and white floral archway.',
    eventType: 'Wedding Reception',
    tags: ['red', 'floral', 'outdoor', 'ceremony', 'arch', 'draping'],
    featured: true,
    sortOrder: 1
  },
  {
    filename: 'IMG_2034.jpg',
    title: 'Elegant Red & White Reception Hall',
    description: 'Full reception hall setup — round tables with white spandex covers and red sashes.',
    eventType: 'Wedding Reception',
    tags: ['red', 'white', 'reception', 'tables', 'hall', 'indoor'],
    featured: true,
    sortOrder: 2
  },
  {
    filename: 'IMG_7241.jpg',
    title: 'Royal Gold Sweetheart Throne',
    description: 'Gold tufted loveseat sweetheart throne against a red and white draped backdrop with cascading white florals.',
    eventType: 'Wedding Reception',
    tags: ['gold', 'throne', 'sweetheart', 'floral', 'red', 'draping'],
    featured: true,
    sortOrder: 3
  },
  {
    filename: 'IMG_7242.jpg',
    title: 'Sweetheart Table — Floral Cascade',
    description: 'Closeup of the white floral cascade framing the sweetheart throne with soft blue ambient lighting.',
    eventType: 'Wedding Reception',
    tags: ['gold', 'throne', 'floral', 'white', 'blue lights'],
    featured: false,
    sortOrder: 4
  },
  {
    filename: 'IMG_7243.jpg',
    title: 'Gold Throne & Red Draping',
    description: 'Sweetheart seating with romantic red and white draping backdrop.',
    eventType: 'Wedding Reception',
    tags: ['gold', 'red', 'draping', 'throne', 'white'],
    featured: false,
    sortOrder: 5
  },
  {
    filename: 'IMG_7244.jpg',
    title: 'White Draping & Gold Backdrop',
    description: 'Layered white and red draping with a gold geometric frame accent and white floral arrangement.',
    eventType: 'Wedding Reception',
    tags: ['white', 'red', 'draping', 'gold', 'floral', 'backdrop'],
    featured: false,
    sortOrder: 6
  },
  {
    filename: 'IMG_7245.jpg',
    title: 'Reception Sweetheart Setup',
    description: 'Full view of the sweetheart throne setup with ambient lighting and floral arrangement.',
    eventType: 'Wedding Reception',
    tags: ['gold', 'throne', 'floral', 'ambient', 'red'],
    featured: false,
    sortOrder: 7
  },
  {
    filename: 'Wedding_Day_Poster.png',
    title: 'Wedding Welcome Signage',
    description: 'Custom illustrated Indian wedding welcome sign.',
    eventType: 'Wedding Reception',
    tags: ['signage', 'welcome', 'indian wedding', 'custom'],
    featured: false,
    sortOrder: 8
  },
  {
    filename: 'YB_Reception.jpg',
    title: 'Reception Welcome Signage',
    description: 'Custom illustrated reception welcome poster with floral arch design.',
    eventType: 'Wedding Reception',
    tags: ['signage', 'reception', 'floral', 'custom', 'illustrated'],
    featured: false,
    sortOrder: 9
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let added = 0;
    let skipped = 0;

    for (const photo of myPhotos) {
      const imageUrl = `${BASE_URL}/uploads/gallery/${photo.filename}`;
      const exists = await Gallery.findOne({ imageUrl });
      if (exists) {
        console.log(`  ⏭  Skipped (already in gallery): ${photo.filename}`);
        skipped++;
        continue;
      }

      await Gallery.create({
        imageUrl,
        thumbnailUrl: imageUrl,
        title: photo.title,
        description: photo.description,
        eventType: photo.eventType,
        tags: photo.tags,
        featured: photo.featured,
        sortOrder: photo.sortOrder
      });

      console.log(`  ✅ Added: ${photo.title}`);
      added++;
    }

    console.log(`\nDone — ${added} added, ${skipped} skipped.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
