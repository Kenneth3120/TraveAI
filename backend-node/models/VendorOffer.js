const mongoose = require('mongoose');

const vendorOfferSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  vendor_id: {
    type: String,
    required: true
  },
  vendor_name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['accommodation', 'food', 'tours', 'transport', 'activities', 'shopping'],
    required: true
  },
  location: String,
  price: Number,
  currency: {
    type: String,
    default: 'INR'
  },
  discount_percentage: Number,
  valid_from: {
    type: Date,
    default: Date.now
  },
  valid_until: {
    type: Date,
    required: true
  },
  terms_conditions: String,
  contact_info: String,
  images: [String], // Base64 encoded images
  tags: [String],
  is_active: {
    type: Boolean,
    default: true
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
vendorOfferSchema.index({ is_active: 1, valid_until: 1 });
vendorOfferSchema.index({ category: 1, location: 1 });

module.exports = mongoose.model('VendorOffer', vendorOfferSchema);