const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Itinerary = require('../models/Itinerary');
const ChatHistory = require('../models/ChatHistory');
const RouteAnalysis = require('../models/RouteAnalysis');
const Vendor = require('../models/Vendor');
const VendorOffer = require('../models/VendorOffer');
const TourismEvent = require('../models/TourismEvent');
const StatusCheck = require('../models/StatusCheck');
const router = express.Router();

// Create status check
router.post('/status', async (req, res) => {
  try {
    const { client_name } = req.body;

    if (!client_name) {
      return res.status(400).json({
        error: 'Client name is required'
      });
    }

    const statusCheckData = {
      id: uuidv4(),
      client_name,
      timestamp: new Date()
    };

    const statusCheck = new StatusCheck(statusCheckData);
    await statusCheck.save();

    res.json({
      id: statusCheck.id,
      client_name: statusCheck.client_name,
      timestamp: statusCheck.timestamp
    });

  } catch (error) {
    console.error('Error creating status check:', error);
    res.status(500).json({
      error: `Failed to create status check: ${error.message}`
    });
  }
});

// Get status checks
router.get('/status', async (req, res) => {
  try {
    const statusChecks = await StatusCheck.find()
      .sort({ timestamp: -1 })
      .limit(1000);

    const formattedChecks = statusChecks.map(check => ({
      id: check.id,
      client_name: check.client_name,
      timestamp: check.timestamp
    }));

    res.json(formattedChecks);

  } catch (error) {
    console.error('Error fetching status checks:', error);
    res.status(500).json({
      error: `Failed to fetch status checks: ${error.message}`
    });
  }
});

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { session_id } = req.query;

    // User-specific stats if session_id provided
    let userStats = {
      trips_planned: 0,
      ai_interactions: 0,
      routes_analyzed: 0,
      countries_visited: 0,
      ai_recommendations: 0
    };

    if (session_id) {
      const [userItineraries, userChatMessages, userRouteAnalyses] = await Promise.all([
        Itinerary.countDocuments({ session_id }),
        ChatHistory.countDocuments({ session_id }),
        RouteAnalysis.countDocuments({ session_id })
      ]);

      userStats = {
        trips_planned: userItineraries,
        ai_interactions: userChatMessages,
        routes_analyzed: userRouteAnalyses,
        countries_visited: Math.min(3, Math.floor(userItineraries / 2)), // Mock calculation
        ai_recommendations: userChatMessages + userItineraries + userRouteAnalyses
      };
    }

    // Global stats
    const [
      totalUsers,
      totalItineraries,
      totalVendors,
      totalOffers,
      totalEvents,
      popularDestinations
    ] = await Promise.all([
      Itinerary.distinct('session_id'),
      Itinerary.countDocuments({}),
      Vendor.countDocuments({ verified: true }),
      VendorOffer.countDocuments({ is_active: true }),
      TourismEvent.countDocuments({ end_date: { $gte: new Date() } }),
      Itinerary.aggregate([
        { $group: { _id: '$destination', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const response = {
      user_stats: userStats,
      global_stats: {
        total_users: totalUsers.length,
        total_trips_planned: totalItineraries,
        verified_vendors: totalVendors,
        active_offers: totalOffers,
        upcoming_events: totalEvents
      },
      popular_destinations: popularDestinations.map(dest => ({
        name: dest._id,
        count: dest.count
      })),
      recent_activity: [
        '🎉 New vendor partnership added',
        '✈️ Route analysis feature improved',
        '🏛️ Cultural heritage events updated',
        '🌊 Beach destinations optimized',
        '🏔️ Mountain trek routes added'
      ]
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: `Failed to fetch dashboard stats: ${error.message}`
    });
  }
});

module.exports = router;