const mongoose = require('mongoose');

const transportOptionSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['train', 'bus', 'flight', 'car'],
    required: true
  },
  duration: String,
  cost_range: String,
  comfort_level: {
    type: String,
    enum: ['Excellent', 'Very Good', 'Good', 'Average']
  },
  recommendations: [String],
  weather_considerations: String
}, { _id: false });

const routeAnalysisSchema = new mongoose.Schema({
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
  from_location: {
    type: String,
    required: true
  },
  to_location: {
    type: String,
    required: true
  },
  distance_km: {
    type: Number,
    required: true
  },
  estimated_travel_time: String,
  transport_options: [transportOptionSchema],
  weather_info: String,
  traffic_conditions: String,
  best_time_to_travel: String,
  local_tips: [String],
  ai_detailed_analysis: String,
  ai_model: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
routeAnalysisSchema.index({ session_id: 1, created_at: -1 });
routeAnalysisSchema.index({ from_location: 1, to_location: 1 });

module.exports = mongoose.model('RouteAnalysis', routeAnalysisSchema);