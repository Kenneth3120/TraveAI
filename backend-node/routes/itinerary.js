const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Itinerary = require('../models/Itinerary');
const geminiService = require('../services/geminiService');
const router = express.Router();

// Generate itinerary endpoint
router.post('/generate-itinerary', async (req, res) => {
  try {
    const { destination, duration, budget, interests, travel_style, session_id } = req.body;

    // Validation
    if (!destination || !duration) {
      return res.status(400).json({
        error: 'Destination and duration are required'
      });
    }

    // Generate itinerary using Gemini
    const generatedItinerary = await geminiService.generateItinerary(
      destination,
      duration,
      budget,
      interests || [],
      travel_style || 'balanced'
    );

    // Create itinerary record
    const itineraryData = {
      id: uuidv4(),
      session_id: session_id || uuidv4(),
      user_request: `${duration}-day ${travel_style || 'balanced'} trip to ${destination}`,
      destination,
      duration: parseInt(duration),
      budget: budget ? parseFloat(budget) : null,
      interests: interests || [],
      travel_style: travel_style || 'balanced',
      generated_itinerary: generatedItinerary,
      ai_model: 'gemini-2.0-flash',
      word_count: generatedItinerary.split(' ').length,
      character_count: generatedItinerary.length,
      created_at: new Date()
    };

    const itinerary = new Itinerary(itineraryData);
    await itinerary.save();

    res.json({
      id: itinerary.id,
      session_id: itinerary.session_id,
      user_request: itinerary.user_request,
      generated_itinerary: itinerary.generated_itinerary,
      created_at: itinerary.created_at
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      error: `Failed to generate your dream itinerary: ${error.message}`
    });
  }
});

// Get user itineraries
router.get('/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const itineraries = await Itinerary.find({ session_id })
      .sort({ created_at: -1 })
      .limit(100);

    const formattedItineraries = itineraries.map(itinerary => ({
      id: itinerary.id,
      destination: itinerary.destination,
      duration: itinerary.duration,
      user_request: itinerary.user_request,
      generated_itinerary: itinerary.generated_itinerary,
      created_at: itinerary.created_at,
      travel_style: itinerary.travel_style,
      interests: itinerary.interests || []
    }));

    res.json(formattedItineraries);

  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({
      error: `Failed to fetch your travel memories: ${error.message}`
    });
  }
});

module.exports = router;