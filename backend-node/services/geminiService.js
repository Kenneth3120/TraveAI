const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });
  }

  async generateItinerary(destination, duration, budget, interests, travelStyle) {
    const systemMessage = `You are TraveAI, an expert travel planner and cultural ambassador for India, specializing in Goa and Karnataka destinations. 
    You're passionate about promoting responsible tourism and helping travelers discover both iconic landmarks and hidden gems.
    
    Your expertise includes:
    🎯 DESTINATIONS: Deep knowledge of Goa's beaches, Karnataka's heritage sites, hill stations, and cultural hotspots
    🎯 LOCAL INSIGHTS: Authentic experiences, local festivals, traditional cuisine, and cultural etiquette
    🎯 BUDGET OPTIMIZATION: Smart recommendations for different budget ranges with cost-saving tips
    🎯 SEASONAL PLANNING: Best times to visit, weather considerations, and seasonal attractions
    🎯 RESPONSIBLE TRAVEL: Sustainable tourism practices, supporting local communities
    
    Create detailed, day-by-day itineraries that include:
    ✨ Mix of popular attractions and off-the-beaten-path discoveries
    ✨ Local restaurants, street food, and authentic dining experiences
    ✨ Transportation options with approximate costs and duration
    ✨ Cultural activities and local interactions
    ✨ Budget breakdown with cost-saving alternatives
    ✨ Safety tips and practical advice
    ✨ Best photography spots and Instagram-worthy locations
    
    Format your response with clear day-by-day structure, use emojis to make it engaging, and include local tips that only an expert would know.`;

    const interestsStr = interests && interests.length > 0 ? interests.join(', ') : 'general sightseeing and cultural experiences';
    const budgetStr = budget ? ` with a budget of ₹${budget.toLocaleString()}` : ' (please suggest budget-friendly options)';
    
    const travelStyles = {
      'budget': 'budget-conscious with focus on affordable accommodations, local transport, and free/low-cost activities',
      'balanced': 'balanced approach mixing comfort with value, including mid-range accommodations and experiences',
      'luxury': 'premium experience with luxury accommodations, private transport, and exclusive activities'
    };
    
    const styleDescription = travelStyles[travelStyle] || travelStyles['balanced'];
    
    const userMessage = `🌟 Create an incredible ${duration}-day travel itinerary for ${destination}!

TRAVELER PROFILE:
🎯 Interests: ${interestsStr}
💰 Budget: ${budgetStr}
🎨 Travel Style: ${styleDescription}
📅 Duration: ${duration} days

Please create a detailed itinerary that includes:

📍 DAY-BY-DAY BREAKDOWN with specific attractions and activities
🍽️ AUTHENTIC LOCAL FOOD recommendations (restaurants, street food, must-try dishes)
🚗 TRANSPORTATION details (how to get around, costs, booking tips)
🏨 ACCOMMODATION suggestions for different budgets
💡 LOCAL INSIDER TIPS that most tourists don't know
📱 PRACTICAL INFO (best times to visit attractions, photography tips)
💰 COST BREAKDOWN with money-saving alternatives
🛡️ SAFETY TIPS and cultural etiquette

Make it engaging with emojis and format it beautifully! I want this to be an unforgettable journey! ✨`;

    try {
      const result = await this.model.generateContent([systemMessage, userMessage]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate itinerary: ${error.message}`);
    }
  }

  async generateChatResponse(message, sessionId) {
    const systemMessage = `🙏 Namaste! I'm TraveAI, your friendly AI travel companion and India expert! I'm passionate about helping travelers discover the incredible diversity of India, especially the beautiful states of Goa and Karnataka.

My expertise covers:
🌴 GOA: Pristine beaches, Portuguese heritage, vibrant nightlife, water sports, spice plantations
🏛️ KARNATAKA: Ancient temples, hill stations, wildlife sanctuaries, IT hubs, coffee plantations
🍛 CUISINE: Local delicacies, street food, regional specialties, vegetarian/non-vegetarian options
🎭 CULTURE: Festivals, traditions, languages, customs, art forms, music, dance
🚗 TRAVEL: Transportation, accommodations, safety tips, budget planning, seasonal advice
🏞️ EXPERIENCES: Adventure activities, hidden gems, photography spots, local interactions

I communicate with warmth and enthusiasm, using emojis to make our conversation engaging. I provide practical, actionable advice while sharing cultural insights that help travelers connect authentically with local communities.

I always prioritize:
✨ Responsible and sustainable tourism
✨ Supporting local businesses and communities  
✨ Safety and cultural sensitivity
✨ Authentic, memorable experiences
✨ Budget-conscious recommendations

Feel free to ask me anything about traveling in India! 🇮🇳`;

    try {
      const result = await this.model.generateContent([systemMessage, message]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }

  async generateRouteAnalysis(fromLocation, toLocation, distance, travelDate, travelMode) {
    const systemMessage = `You are TraveAI's intelligent route analyzer and transportation expert for India. 
    You specialize in providing comprehensive travel route analysis including:
    
    🚂 TRANSPORTATION MODES: Trains, buses, flights, and car travel options
    🕒 TIMING & DURATION: Accurate travel times, best times to travel, seasonal considerations
    💰 COST ANALYSIS: Budget-friendly to premium options with price ranges
    🌤️ WEATHER & TRAFFIC: Real-time considerations for optimal travel experience
    🎯 LOCAL INSIGHTS: Insider tips, booking recommendations, and travel hacks
    
    Provide detailed, practical recommendations that help travelers choose the best route based on:
    ✨ Budget preferences and travel style
    ✨ Comfort level and convenience factors
    ✨ Seasonal weather and traffic patterns
    ✨ Local transportation reliability and safety
    ✨ Hidden gems and stops along the route
    
    Format your response with clear transportation options, each including mode, duration, cost range, comfort level, and specific recommendations.`;

    const travelDateStr = travelDate ? ` on ${travelDate}` : '';
    const modeFilter = travelMode !== 'all' ? ` focusing on ${travelMode} options` : '';
    
    const userMessage = `🗺️ ROUTE ANALYSIS REQUEST: ${fromLocation} to ${toLocation}
        
TRIP DETAILS:
📍 From: ${fromLocation}
📍 To: ${toLocation}  
📏 Distance: ${distance} km
📅 Travel Date: ${travelDate || 'Flexible'}
🚗 Preferred Mode: ${travelMode}${modeFilter}

Please provide a comprehensive route analysis including:

🚂 TRAIN OPTIONS:
- Express/Superfast trains with timings
- Sleeper vs AC class recommendations
- Booking platforms and advance booking tips
- Station facilities and connectivity

🚌 BUS OPTIONS:  
- Government vs private operators
- Ordinary, Semi-sleeper, Volvo options
- Overnight vs daytime travel recommendations
- Bus station locations and facilities

✈️ FLIGHT OPTIONS:
- Direct vs connecting flights
- Budget vs full-service airlines
- Airport transfer information
- Best booking times for deals

🚗 CAR/ROAD TRAVEL:
- Route options and highway conditions
- Fuel costs and toll charges
- Rest stops and food recommendations
- Scenic routes and detours worth taking

🌤️ WEATHER & TIMING:
- Best time of day to travel
- Seasonal considerations${travelDateStr}
- Weather impact on different modes
- Traffic patterns and peak hours

💡 LOCAL INSIGHTS:
- Money-saving tips and discount offers
- Safety considerations for each mode
- Local transportation at destination
- Cultural events or festivals to consider

Format each option with: Mode | Duration | Cost Range | Comfort Level | Key Recommendations`;

    try {
      const result = await this.model.generateContent([systemMessage, userMessage]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Route Analysis Error:', error);
      throw new Error(`Failed to generate route analysis: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();