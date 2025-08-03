const express = require('express');
const router = express.Router();

// Get popular destinations
router.get('/', async (req, res) => {
  try {
    const destinations = [
      {
        name: 'Goa',
        type: 'Beach Paradise',
        highlights: ['Pristine beaches', 'Portuguese heritage', 'Vibrant nightlife', 'Water sports'],
        best_time: 'November to March',
        avg_budget: '₹2,000-5,000/day',
        image_hint: 'golden beaches, palm trees'
      },
      {
        name: 'Bangalore',
        type: 'Garden City',
        highlights: ['IT hub', 'Pleasant climate', 'Craft breweries', 'Modern culture'],
        best_time: 'October to February',
        avg_budget: '₹1,500-4,000/day',
        image_hint: 'urban skyline, gardens'
      },
      {
        name: 'Mysore',
        type: 'Heritage City',
        highlights: ['Royal palaces', 'Silk sarees', 'Yoga centers', 'Classical architecture'],
        best_time: 'October to March',
        avg_budget: '₹1,200-3,000/day',
        image_hint: 'palace, heritage architecture'
      },
      {
        name: 'Coorg',
        type: 'Scotland of India',
        highlights: ['Coffee plantations', 'Misty hills', 'Adventure sports', 'Wildlife'],
        best_time: 'October to March',
        avg_budget: '₹2,000-4,500/day',
        image_hint: 'coffee plantations, hills'
      },
      {
        name: 'Hampi',
        type: 'UNESCO World Heritage',
        highlights: ['Ancient ruins', 'Boulder landscapes', 'Historical significance', 'Photography'],
        best_time: 'October to February',
        avg_budget: '₹800-2,500/day',
        image_hint: 'ancient ruins, boulders'
      },
      {
        name: 'Gokarna',
        type: 'Spiritual Beach Town',
        highlights: ['Pristine beaches', 'Temple town', 'Hippie culture', 'Trekking'],
        best_time: 'November to March',
        avg_budget: '₹1,000-3,000/day',
        image_hint: 'beaches, temples'
      }
    ];
    
    res.json({
      destinations,
      total_count: destinations.length,
      featured_states: ['Goa', 'Karnataka'],
      travel_tip: '🌟 Each destination offers unique experiences - from beach relaxation to cultural immersion!'
    });

  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      error: 'Failed to fetch destinations'
    });
  }
});

module.exports = router;