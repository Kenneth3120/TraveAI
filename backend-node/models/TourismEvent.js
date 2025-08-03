const mongoose = require('mongoose');

const tourismEventSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  event_type: {
    type: String,
    enum: ['festival', 'cultural', 'adventure', 'food', 'nature'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  entry_fee: Number,
  organizer: String,
  contact_info: String,
  images: [String], // Base64 encoded images
  tags: [String],
  is_featured: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
tourismEventSchema.index({ start_date: 1, end_date: 1 });
tourismEventSchema.index({ event_type: 1, location: 1 });
tourismEventSchema.index({ is_featured: 1 });

module.exports = mongoose.model('TourismEvent', tourismEventSchema);