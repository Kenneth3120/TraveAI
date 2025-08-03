const express = require('express');
const { v4: uuidv4 } = require('uuid');
const TourismEvent = require('../models/TourismEvent');
const VendorOffer = require('../models/VendorOffer');
const router = express.Router();

// Create tourism event
router.post('/tourism-events', async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const event = new TourismEvent(eventData);
    await event.save();

    res.status(201).json(event);

  } catch (error) {
    console.error('Error creating tourism event:', error);
    res.status(500).json({
      error: `Failed to create tourism event: ${error.message}`
    });
  }
});

// Get tourism events
router.get('/tourism-events', async (req, res) => {
  try {
    const { event_type, location, featured_only = 'false' } = req.query;
    
    let query = {
      end_date: { $gte: new Date() } // Only show upcoming or current events
    };
    
    if (featured_only === 'true') {
      query.is_featured = true;
    }
    
    if (event_type) {
      query.event_type = event_type;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const events = await TourismEvent.find(query)
      .sort({ start_date: 1 })
      .limit(50);

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      location: event.location,
      start_date: event.start_date,
      end_date: event.end_date,
      entry_fee: event.entry_fee,
      organizer: event.organizer,
      contact_info: event.contact_info,
      images: event.images ? event.images.slice(0, 1) : [], // Only first image for list view
      tags: event.tags,
      is_featured: event.is_featured
    }));

    res.json(formattedEvents);

  } catch (error) {
    console.error('Error fetching tourism events:', error);
    res.status(500).json({
      error: `Failed to fetch tourism events: ${error.message}`
    });
  }
});

// Get explore content - featured offers and events
router.get('/explore', async (req, res) => {
  try {
    // Get featured offers (limit to 6)
    const featuredOffers = await VendorOffer.find({
      is_active: true,
      valid_until: { $gte: new Date() }
    }).sort({ created_at: -1 }).limit(6);

    // Get featured events (limit to 6)
    const featuredEvents = await TourismEvent.find({
      is_featured: true,
      end_date: { $gte: new Date() }
    }).sort({ start_date: 1 }).limit(6);

    // Get recent offers (limit to 8)
    const recentOffers = await VendorOffer.find({
      is_active: true,
      valid_until: { $gte: new Date() }
    }).sort({ created_at: -1 }).limit(8);

    const response = {
      featured_offers: featuredOffers.map(offer => ({
        id: offer.id,
        vendor_name: offer.vendor_name,
        title: offer.title,
        description: offer.description.length > 150 ? 
          offer.description.substring(0, 150) + '...' : offer.description,
        category: offer.category,
        location: offer.location,
        price: offer.price,
        currency: offer.currency,
        discount_percentage: offer.discount_percentage,
        images: offer.images ? offer.images.slice(0, 1) : [],
        tags: offer.tags ? offer.tags.slice(0, 3) : [] // Limit tags for display
      })),
      featured_events: featuredEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description.length > 150 ? 
          event.description.substring(0, 150) + '...' : event.description,
        event_type: event.event_type,
        location: event.location,
        start_date: event.start_date,
        end_date: event.end_date,
        entry_fee: event.entry_fee,
        organizer: event.organizer,
        images: event.images ? event.images.slice(0, 1) : [],
        tags: event.tags ? event.tags.slice(0, 3) : []
      })),
      recent_offers: recentOffers.map(offer => ({
        id: offer.id,
        vendor_name: offer.vendor_name,
        title: offer.title,
        category: offer.category,
        location: offer.location,
        price: offer.price,
        discount_percentage: offer.discount_percentage,
        images: offer.images ? offer.images.slice(0, 1) : []
      })),
      stats: {
        total_offers: recentOffers.length,
        total_events: featuredEvents.length,
        categories: ['accommodation', 'food', 'tours', 'transport', 'activities', 'shopping']
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching explore content:', error);
    res.status(500).json({
      error: `Failed to fetch explore content: ${error.message}`
    });
  }
});

module.exports = router;