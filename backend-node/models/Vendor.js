const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  business_type: {
    type: String,
    enum: ['hotel', 'restaurant', 'tour_guide', 'transport', 'activity', 'shopping'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: String,
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  total_reviews: {
    type: Number,
    default: 0
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
vendorSchema.index({ business_type: 1, location: 1 });
vendorSchema.index({ verified: 1, rating: -1 });

module.exports = mongoose.model('Vendor', vendorSchema);