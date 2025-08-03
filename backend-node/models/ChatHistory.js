const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  user_message: {
    type: String,
    required: true
  },
  ai_response: {
    type: String,
    required: true
  },
  ai_model: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  message_length: Number,
  response_length: Number,
  conversation_context: {
    type: String,
    default: 'travel_assistance'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
chatHistorySchema.index({ session_id: 1, timestamp: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);