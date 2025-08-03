# TraveAI Node.js Backend

A complete Node.js/Express backend for the TraveAI travel planning application, featuring AI-powered itinerary generation, route analysis, and comprehensive travel assistance.

## Features

- 🤖 **AI Integration**: Powered by Google Gemini 2.0 Flash for intelligent responses
- 🗺️ **Route Analysis**: Smart transportation recommendations with distance calculations
- 💬 **Chat System**: AI-powered travel assistant with conversation history
- 🏨 **Vendor Management**: Local business collaboration and offer management
- 🎉 **Event Management**: Tourism event discovery and promotion
- 📊 **Analytics Dashboard**: Real-time statistics and user insights
- 🛡️ **Security**: Rate limiting, CORS protection, and input validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Service**: Google Gemini API
- **Geolocation**: OpenStreetMap Geocoding
- **Authentication**: Ready for Clerk integration

## API Endpoints

### Core Features
- `POST /api/generate-itinerary` - Generate AI-powered travel itineraries
- `POST /api/chat` - AI travel assistant chat
- `POST /api/analyze-route` - Smart route analysis with transport options

### Data Management
- `GET /api/destinations` - Popular travel destinations
- `GET /api/itineraries/:session_id` - User's saved itineraries
- `GET /api/chat-history/:session_id` - Chat conversation history
- `GET /api/route-analyses/:session_id` - User's route analyses

### Business Features
- `GET/POST /api/vendors` - Vendor management
- `GET/POST /api/vendors/offers` - Vendor offers management
- `GET/POST /api/events/tourism-events` - Event management
- `GET /api/explore` - Featured content discovery
- `GET /api/dashboard-stats` - Analytics dashboard

### System
- `GET /api/health` - System health check
- `GET/POST /api/status` - Status monitoring

## Installation

1. **Install Dependencies**
```bash
cd backend-node
npm install
```

2. **Environment Setup**
```bash
# Copy .env file and update values
cp .env.example .env
```

3. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

```env
PORT=8001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
DB_NAME=traveai
GEMINI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Database Collections

- `itineraries` - Generated travel itineraries
- `chathistories` - AI chat conversations
- `routeanalyses` - Route analysis results
- `vendors` - Local business profiles
- `vendoroffers` - Business offers and deals
- `tourismevents` - Local events and activities
- `statuschecks` - System monitoring data

## Development

- Uses MongoDB Atlas for cloud database
- Implements comprehensive error handling
- Includes request validation and sanitization
- Supports rate limiting and security headers
- Structured logging with Winston

## Migration from Python

This backend replaces the original Python FastAPI backend while maintaining:
- ✅ All existing API endpoints and functionality
- ✅ Same response formats and data structures  
- ✅ Gemini AI integration for intelligent responses
- ✅ Geolocation services for route analysis
- ✅ MongoDB data persistence
- ✅ Session-based user management

## License

MIT License - Built for TraveAI