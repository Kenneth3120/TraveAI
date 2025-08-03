const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  session_id: {
    type: String,
    required: true,
    index: true
  },
  user_request: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  budget: {
    type: Number,
    default: null
  },
  interests: [{
    type: String
  }],
  travel_style: {
    type: String,
    enum: ['budget', 'balanced', 'luxury'],
    default: 'balanced'
  },
  generated_itinerary: {
    type: String,
    required: true
  },
  ai_model: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  word_count: Number,
  character_count: Number,
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
itinerarySchema.index({ session_id: 1, created_at: -1 });
itinerarySchema.index({ destination: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);