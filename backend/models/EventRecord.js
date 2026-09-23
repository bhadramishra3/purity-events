const mongoose = require('mongoose');

const eventRecordSchema = new mongoose.Schema(
  {
    eventName:    { type: String, required: true, trim: true },
    clientName:   { type: String, trim: true },
    eventDate:    { type: Date },
    eventType:    { type: String, trim: true },
    decorType:    { type: String, trim: true },
    venue:        { type: String, trim: true },
    guestCount:   { type: Number, min: 0, default: 0 },
    durationHours:{ type: Number, min: 0, default: 0 },
    amountCharged:{ type: Number, min: 0, default: 0 },
    expenses:     { type: Number, min: 0, default: 0 },
    notes:        { type: String, trim: true },
    sortOrder:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventRecordSchema.index({ eventDate: -1 });

module.exports = mongoose.model('EventRecord', eventRecordSchema);
