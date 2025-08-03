const express = require('express');
const { v4: uuidv4 } = require('uuid');
const RouteAnalysis = require('../models/RouteAnalysis');
const geminiService = require('../services/geminiService');
const geoService = require('../services/geoService');
const router = express.Router();

// Analyze route endpoint
router.post('/analyze-route', async (req, res) => {
  try {
    const { from_location, to_location, travel_date, travel_mode, session_id } = req.body;

    // Validation
    if (!from_location || !to_location) {
      return res.status(400).json({
        error: 'Both from and to locations are required'
      });
    }

    // Get distance and coordinates
    const geoData = await geoService.getDistanceBetweenLocations(from_location, to_location);
    const distance = geoData.distanceKm;

    // Generate transport options
    const transportOptions = geoService.generateTransportOptions(distance);
    const estimatedTravelTime = geoService.generateEstimatedTravelTime(transportOptions);
    const localTips = geoService.generateLocalTips();

    // Generate detailed AI analysis
    const aiAnalysis = await geminiService.generateRouteAnalysis(
      from_location, 
      to_location, 
      distance, 
      travel_date, 
      travel_mode || 'all'
    );

    // Create route analysis record
    const routeAnalysisData = {
      id: uuidv4(),
      session_id: session_id || uuidv4(),
      from_location,
      to_location,
      distance_km: distance,
      estimated_travel_time: estimatedTravelTime,
      transport_options: transportOptions,
      weather_info: 'Check weather conditions before travel',
      traffic_conditions: 'Plan for peak hour delays in urban areas',
      best_time_to_travel: 'Early morning (6-8 AM) or late evening (8-10 PM)',
      local_tips: localTips,
      ai_detailed_analysis: aiAnalysis,
      ai_model: 'gemini-2.0-flash',
      created_at: new Date()
    };

    const routeAnalysis = new RouteAnalysis(routeAnalysisData);
    await routeAnalysis.save();

    // Return response (excluding MongoDB _id field)
    const response = {
      id: routeAnalysis.id,
      session_id: routeAnalysis.session_id,
      from_location: routeAnalysis.from_location,
      to_location: routeAnalysis.to_location,
      distance_km: routeAnalysis.distance_km,
      estimated_travel_time: routeAnalysis.estimated_travel_time,
      transport_options: routeAnalysis.transport_options,
      weather_info: routeAnalysis.weather_info,
      traffic_conditions: routeAnalysis.traffic_conditions,
      best_time_to_travel: routeAnalysis.best_time_to_travel,
      local_tips: routeAnalysis.local_tips,
      created_at: routeAnalysis.created_at
    };

    res.json(response);

  } catch (error) {
    console.error('Error analyzing route:', error);
    
    if (error.message.includes('Unable to find') || error.message.includes('Failed to geocode')) {
      return res.status(400).json({
        error: 'Unable to find one or both locations. Please check location names.'
      });
    }

    res.status(500).json({
      error: `Failed to analyze route: ${error.message}`
    });
  }
});

// Get route analyses
router.get('/route-analyses/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const analyses = await RouteAnalysis.find({ session_id })
      .sort({ created_at: -1 })
      .limit(50);

    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      from_location: analysis.from_location,
      to_location: analysis.to_location,
      distance_km: analysis.distance_km,
      transport_options: analysis.transport_options,
      created_at: analysis.created_at,
      ai_detailed_analysis: analysis.ai_detailed_analysis
    }));

    res.json(formattedAnalyses);

  } catch (error) {
    console.error('Error fetching route analyses:', error);
    res.status(500).json({
      error: `Failed to fetch route analyses: ${error.message}`
    });
  }
});

module.exports = router;