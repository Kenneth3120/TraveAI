const express = require('express');
const ChatHistory = require('../models/ChatHistory');
const geminiService = require('../services/geminiService');
const router = express.Router();

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // Generate AI response using Gemini
    const aiResponse = await geminiService.generateChatResponse(message, session_id);

    // Save chat history
    const chatData = {
      session_id: session_id || 'anonymous',
      user_message: message,
      ai_response: aiResponse,
      ai_model: 'gemini-2.0-flash',
      message_length: message.length,
      response_length: aiResponse.length,
      conversation_context: 'travel_assistance',
      timestamp: new Date()
    };

    const chatHistory = new ChatHistory(chatData);
    await chatHistory.save();

    res.json({
      response: aiResponse,
      session_id: session_id
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: 'Sorry, I encountered an issue. Let\'s try again! 🤖'
    });
  }
});

// Get chat history
router.get('/chat-history/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const chatHistory = await ChatHistory.find({ session_id })
      .sort({ timestamp: -1 })
      .limit(limit);

    const formattedHistory = chatHistory.reverse().map(chat => ({
      user_message: chat.user_message,
      ai_response: chat.ai_response,
      timestamp: chat.timestamp
    }));

    res.json(formattedHistory);

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      error: `Failed to fetch conversation history: ${error.message}`
    });
  }
});

module.exports = router;