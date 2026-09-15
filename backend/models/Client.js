const mongoose = require('mongoose');

// ─── CLIENT SCHEMA ───────────────────────────────────────────────────────────
const clientSchema = new mongoose.Schema(
  {
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // Password for admin accounts only
    password: { type: String, select: false }
  },
  { timestamps: true }
);

// email index comes from unique:true; googleId/facebookId from sparse:true

// ─── BOOKING SCHEMA ───────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    clientName: { type: String },
    clientEmail: { type: String },
    clientPhone: { type: String },

    eventType: {
      type: String,
      required: true,
      enum: [
        'Birthday Party',
        'Wedding Reception',
        'Baby Shower',
        'Bridal Shower',
        'Anniversary',
        'Corporate Event',
        'Graduation Party',
        'Gender Reveal',
        'Holiday Party',
        'Other'
      ]
    },
    eventDate: { type: Date, required: true },
    eventTime: { type: String },
    venue: { type: String, required: true, trim: true },
    venueAddress: { type: String, trim: true },
    guestCount: { type: Number, min: 1 },

    // Package selection
    selectedPackage: {
      type: String,
      enum: [
        'Intimate Elegance',
        'Classic Celebration',
        'Grand Luxe',
        'Corporate Premier',
        'Bespoke Couture'
      ]
    },

    // Features/add-ons selected
    selectedFeatures: [
      {
        name: { type: String },
        price: { type: Number }
      }
    ],

    // Table setup details
    tableCount: { type: Number, min: 0, default: 0 },
    tableCenterpieces: {
      type: String,
      enum: ['Floral', 'Candle', 'Mixed', 'Balloon', 'Custom', 'None'],
      default: 'None'
    },

    // Budget
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },

    // Deposit
    depositAmount: { type: Number, default: 0 },
    depositPaid: { type: Boolean, default: false },
    depositPaidDate: { type: Date },

    // Status
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },

    // Special requests & notes
    specialRequests: { type: String, trim: true },
    colorTheme: { type: String, trim: true },
    adminNotes: { type: String, trim: true },

    // Reference to vision board
    visionBoardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisionBoard'
    },

    totalAmount: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Deposit Paid', 'Paid in Full'],
      default: 'Unpaid'
    }
  },
  { timestamps: true }
);

bookingSchema.index({ clientId: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ bookingStatus: 1 });

// ─── GALLERY SCHEMA ───────────────────────────────────────────────────────────
const gallerySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    eventType: {
      type: String,
      required: true,
      enum: [
        'Birthday Party',
        'Wedding Reception',
        'Baby Shower',
        'Bridal Shower',
        'Anniversary',
        'Corporate Event',
        'Graduation Party',
        'Gender Reveal',
        'Holiday Party',
        'All'
      ]
    },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

gallerySchema.index({ eventType: 1 });
gallerySchema.index({ featured: 1 });
gallerySchema.index({ tags: 1 });

// ─── VISION BOARD SCHEMA ──────────────────────────────────────────────────────
const visionBoardSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    title: { type: String, trim: true, default: 'My Vision Board' },

    // Inspiration images (URLs or uploaded)
    inspirationImages: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        source: { type: String } // 'upload', 'search', 'gallery'
      }
    ],

    // Color palette
    colors: [
      {
        hex: { type: String },
        name: { type: String }
      }
    ],

    // Style preferences
    style: {
      type: String,
      enum: ['Elegant', 'Rustic', 'Modern', 'Bohemian', 'Vintage', 'Tropical', 'Minimalist', 'Glamorous'],
    },

    // Notes
    notes: { type: String, trim: true },

    // Event details linked
    eventType: { type: String },
    eventDate: { type: Date }
  },
  { timestamps: true }
);

visionBoardSchema.index({ clientId: 1 });

// ─── EXPORTS ─────────────────────────────────────────────────────────────────
const Client = mongoose.model('Client', clientSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const VisionBoard = mongoose.model('VisionBoard', visionBoardSchema);

module.exports = { Client, Booking, Gallery, VisionBoard };
