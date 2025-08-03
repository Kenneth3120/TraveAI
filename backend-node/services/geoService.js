const NodeGeocoder = require('node-geocoder');
const geolib = require('geolib');

class GeoService {
  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'openstreetmap',
      httpAdapter: 'https',
      formatter: null,
      apiKey: null, // OpenStreetMap doesn't require API key
      timeout: 10000,
      extra: {
        userAgent: 'TraveAI/1.0.0 (https://emergent-agent.com; travel-app@example.com)',
        referrer: 'https://emergent-agent.com'
      }
    });
  }

  async getCoordinates(location) {
    try {
      const results = await this.geocoder.geocode(`${location}, India`);
      
      if (!results || results.length === 0) {
        throw new Error(`Unable to find coordinates for ${location}`);
      }

      const result = results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress
      };
    } catch (error) {
      console.error(`Geocoding error for ${location}:`, error);
      throw new Error(`Failed to geocode location: ${location}`);
    }
  }

  calculateDistance(coord1, coord2) {
    try {
      const distance = geolib.getDistance(
        { latitude: coord1.latitude, longitude: coord1.longitude },
        { latitude: coord2.latitude, longitude: coord2.longitude }
      );
      
      // Convert meters to kilometers
      return distance / 1000;
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw new Error('Failed to calculate distance');
    }
  }

  async getDistanceBetweenLocations(fromLocation, toLocation) {
    try {
      const [fromCoords, toCoords] = await Promise.all([
        this.getCoordinates(fromLocation),
        this.getCoordinates(toLocation)
      ]);

      const distance = this.calculateDistance(fromCoords, toCoords);

      return {
        fromCoordinates: fromCoords,
        toCoordinates: toCoords,
        distanceKm: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    } catch (error) {
      console.error('Get distance error:', error);
      throw error;
    }
  }

  generateTransportOptions(distance) {
    const options = [];

    if (distance < 100) {
      // Short distance - bus and car recommended
      options.push({
        mode: 'bus',
        duration: `${Math.floor(distance/40)}-${Math.floor(distance/30)} hours`,
        cost_range: '₹100-400',
        comfort_level: 'Good',
        recommendations: ['Government buses reliable', 'Book seats in advance', 'Carry water and snacks'],
        weather_considerations: 'Check road conditions during monsoon'
      });

      options.push({
        mode: 'car',
        duration: `${Math.floor(distance/50)}-${Math.floor(distance/40)} hours`,
        cost_range: `₹${Math.floor(distance*8)}-${Math.floor(distance*12)} (fuel + tolls)`,
        comfort_level: 'Excellent',
        recommendations: ['Use GPS navigation', 'Plan rest stops', 'Check traffic updates'],
        weather_considerations: 'Avoid night travel in hilly areas'
      });

    } else if (distance < 500) {
      // Medium distance - train, bus, and flight options
      options.push({
        mode: 'train',
        duration: `${Math.floor(distance/60)}-${Math.floor(distance/40)} hours`,
        cost_range: '₹200-1500',
        comfort_level: 'Very Good',
        recommendations: ['Book AC class for comfort', 'Check IRCTC for schedules', 'Arrive 30 mins early'],
        weather_considerations: 'Reliable in all weather conditions'
      });

      options.push({
        mode: 'bus',
        duration: `${Math.floor(distance/45)}-${Math.floor(distance/35)} hours`,
        cost_range: '₹300-800',
        comfort_level: 'Good',
        recommendations: ['Choose Volvo for long routes', 'Book online for better seats', 'Carry medicines'],
        weather_considerations: 'May face delays during heavy rains'
      });

      options.push({
        mode: 'flight',
        duration: '1.5-3 hours (flight time only)',
        cost_range: '₹3000-8000',
        comfort_level: 'Excellent',
        recommendations: ['Book 2-3 weeks in advance', 'Check baggage allowance', 'Arrive 2 hours early'],
        weather_considerations: 'May face delays during monsoon/fog'
      });

    } else {
      // Long distance - prioritize flight and train
      options.push({
        mode: 'flight',
        duration: '2-4 hours (flight time only)',
        cost_range: '₹4000-12000',
        comfort_level: 'Excellent',
        recommendations: ['Compare airlines for best deals', 'Consider connecting flights', 'Book meals in advance'],
        weather_considerations: 'Most reliable option regardless of weather'
      });

      options.push({
        mode: 'train',
        duration: `${Math.floor(distance/50)}-${Math.floor(distance/35)} hours`,
        cost_range: '₹500-3000',
        comfort_level: 'Very Good',
        recommendations: ['Book AC 2-tier or 1-tier for comfort', 'Carry food and entertainment', 'Book early for popular routes'],
        weather_considerations: 'Reliable year-round with minor delays'
      });
    }

    return options;
  }

  generateEstimatedTravelTime(transportOptions) {
    if (!transportOptions || transportOptions.length === 0) {
      return 'N/A';
    }

    // Find the option with shortest duration
    let minDuration = Infinity;
    transportOptions.forEach(option => {
      const durationMatch = option.duration.match(/(\d+)/);
      if (durationMatch) {
        const duration = parseInt(durationMatch[1]);
        if (duration < minDuration) {
          minDuration = duration;
        }
      }
    });

    return minDuration === Infinity ? 'N/A' : `${minDuration}-${minDuration + 2} hours (fastest option)`;
  }

  generateLocalTips() {
    return [
      'Book tickets in advance for better prices',
      'Carry valid ID proof for all modes of transport',
      'Keep emergency contact numbers handy',
      'Download offline maps for road travel',
      'Check for local festivals or events that might affect travel'
    ];
  }
}

module.exports = new GeoService();