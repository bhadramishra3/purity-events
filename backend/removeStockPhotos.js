require('dotenv').config();
const mongoose = require('mongoose');
const { Gallery } = require('./models/Client');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Gallery.deleteMany({ imageUrl: /unsplash\.com/ });
  console.log(`✅ Removed ${result.deletedCount} stock photos.`);
  await mongoose.disconnect();
}

run().catch(console.error);
