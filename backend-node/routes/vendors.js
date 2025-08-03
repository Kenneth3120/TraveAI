const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Vendor = require('../models/Vendor');
const VendorOffer = require('../models/VendorOffer');
const router = express.Router();

// Create vendor
router.post('/', async (req, res) => {
  try {
    const vendorData = {
      ...req.body,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const vendor = new Vendor(vendorData);
    await vendor.save();

    res.status(201).json(vendor);

  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      error: `Failed to create vendor profile: ${error.message}`
    });
  }
});

// Get vendors
router.get('/', async (req, res) => {
  try {
    const { business_type, location } = req.query;
    
    let query = { verified: true };
    
    if (business_type) {
      query.business_type = business_type;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const vendors = await Vendor.find(query)
      .sort({ rating: -1 })
      .limit(100);

    const formattedVendors = vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      business_type: vendor.business_type,
      location: vendor.location,
      description: vendor.description,
      rating: vendor.rating,
      total_reviews: vendor.total_reviews
    }));

    res.json(formattedVendors);

  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      error: `Failed to fetch vendors: ${error.message}`
    });
  }
});

// Get vendor details
router.get('/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;
    
    const vendor = await Vendor.findOne({ id: vendor_id });
    
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found'
      });
    }

    res.json(vendor);

  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({
      error: `Failed to fetch vendor details: ${error.message}`
    });
  }
});

// Create vendor offer
router.post('/offers', async (req, res) => {
  try {
    const offerData = {
      ...req.body,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const offer = new VendorOffer(offerData);
    await offer.save();

    res.status(201).json(offer);

  } catch (error) {
    console.error('Error creating vendor offer:', error);
    res.status(500).json({
      error: `Failed to create vendor offer: ${error.message}`
    });
  }
});

// Get vendor offers
router.get('/offers', async (req, res) => {
  try {
    const { category, location, active_only = 'true' } = req.query;
    
    let query = {};
    
    if (active_only === 'true') {
      query.is_active = true;
      query.valid_until = { $gte: new Date() };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const offers = await VendorOffer.find(query)
      .sort({ created_at: -1 })
      .limit(50);

    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      vendor_name: offer.vendor_name,
      title: offer.title,
      description: offer.description,
      category: offer.category,
      location: offer.location,
      price: offer.price,
      currency: offer.currency,
      discount_percentage: offer.discount_percentage,
      valid_until: offer.valid_until,
      contact_info: offer.contact_info,
      images: offer.images ? offer.images.slice(0, 1) : [], // Only first image for list view
      tags: offer.tags
    }));

    res.json(formattedOffers);

  } catch (error) {
    console.error('Error fetching vendor offers:', error);
    res.status(500).json({
      error: `Failed to fetch vendor offers: ${error.message}`
    });
  }
});

// Get vendor offer details
router.get('/offers/:offer_id', async (req, res) => {
  try {
    const { offer_id } = req.params;
    
    const offer = await VendorOffer.findOne({ id: offer_id });
    
    if (!offer) {
      return res.status(404).json({
        error: 'Offer not found'
      });
    }

    res.json(offer);

  } catch (error) {
    console.error('Error fetching offer details:', error);
    res.status(500).json({
      error: `Failed to fetch offer details: ${error.message}`
    });
  }
});

module.exports = router;