from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="TraveAI API",
    description="AI-Powered Travel Planning Assistant for India",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Gemini API Key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
CLERK_SECRET_KEY = os.environ.get('CLERK_SECRET_KEY')

# Enhanced Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ItineraryRequest(BaseModel):
    destination: str
    duration: int
    budget: Optional[float] = None
    interests: List[str] = []
    travel_style: str = "balanced"
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ItineraryResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_request: str
    generated_itinerary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Enhanced user management
class UserProfile(BaseModel):
    user_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    travel_preferences: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Travel stats
class TravelStats(BaseModel):
    user_id: str
    total_trips: int = 0
    countries_visited: int = 0
    ai_recommendations: int = 0
    favorite_destinations: List[str] = []

# Route Analysis Models
class RouteAnalysisRequest(BaseModel):
    from_location: str
    to_location: str
    travel_date: Optional[str] = None
    travel_mode: str = "all"  # all, train, bus, flight
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class TransportOption(BaseModel):
    mode: str  # train, bus, flight, car
    duration: str
    cost_range: str
    comfort_level: str
    recommendations: List[str]
    weather_considerations: Optional[str] = None

class RouteAnalysisResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    from_location: str
    to_location: str
    distance_km: float
    estimated_travel_time: str
    transport_options: List[TransportOption]
    weather_info: Optional[str] = None
    traffic_conditions: Optional[str] = None
    best_time_to_travel: Optional[str] = None
    local_tips: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {
        "message": "🌟 TraveAI Backend is running!",
        "description": "Your AI-powered travel companion for exploring India",
        "version": "1.0.0",
        "features": [
            "AI Itinerary Generation",
            "Smart Chat Assistant",
            "Personalized Recommendations",
            "Local Insights"
        ]
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest):
    try:
        # Enhanced system message for travel planning
        system_message = """You are TraveAI, an expert travel planner and cultural ambassador for India, specializing in Goa and Karnataka destinations. 
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
        
        Format your response with clear day-by-day structure, use emojis to make it engaging, and include local tips that only an expert would know."""
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash").with_max_tokens(4096)
        
        # Create enhanced user message
        interests_str = ", ".join(request.interests) if request.interests else "general sightseeing and cultural experiences"
        budget_str = f" with a budget of ₹{request.budget:,.0f}" if request.budget else " (please suggest budget-friendly options)"
        
        travel_styles = {
            "budget": "budget-conscious with focus on affordable accommodations, local transport, and free/low-cost activities",
            "balanced": "balanced approach mixing comfort with value, including mid-range accommodations and experiences",
            "luxury": "premium experience with luxury accommodations, private transport, and exclusive activities"
        }
        
        style_description = travel_styles.get(request.travel_style, "balanced")
        
        user_message = UserMessage(
            text=f"""🌟 Create an incredible {request.duration}-day travel itinerary for {request.destination}!

TRAVELER PROFILE:
🎯 Interests: {interests_str}
💰 Budget: {budget_str}
🎨 Travel Style: {style_description}
📅 Duration: {request.duration} days

Please create a detailed itinerary that includes:

📍 DAY-BY-DAY BREAKDOWN with specific attractions and activities
🍽️ AUTHENTIC LOCAL FOOD recommendations (restaurants, street food, must-try dishes)
🚗 TRANSPORTATION details (how to get around, costs, booking tips)
🏨 ACCOMMODATION suggestions for different budgets
💡 LOCAL INSIDER TIPS that most tourists don't know
📱 PRACTICAL INFO (best times to visit attractions, photography tips)
💰 COST BREAKDOWN with money-saving alternatives
🛡️ SAFETY TIPS and cultural etiquette

Make it engaging with emojis and format it beautifully! I want this to be an unforgettable journey! ✨"""
        )
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Save to database with enhanced metadata
        itinerary_data = {
            "session_id": request.session_id,
            "user_request": f"{request.duration}-day {request.travel_style} trip to {request.destination}",
            "destination": request.destination,
            "duration": request.duration,
            "budget": request.budget,
            "interests": request.interests,
            "travel_style": request.travel_style,
            "generated_itinerary": response,
            "created_at": datetime.utcnow(),
            "ai_model": "gemini-2.0-flash",
            "word_count": len(response.split()),
            "character_count": len(response)
        }
        
        result = await db.itineraries.insert_one(itinerary_data)
        itinerary_data["id"] = str(result.inserted_id)
        
        # Update user stats (if we had user context)
        # This would increment AI recommendations count
        
        return ItineraryResponse(
            id=str(result.inserted_id),
            session_id=request.session_id,
            user_request=itinerary_data["user_request"],
            generated_itinerary=response
        )
        
    except Exception as e:
        logging.error(f"Error generating itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate your dream itinerary: {str(e)}")

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        # Enhanced system message for travel chat
        system_message = """🙏 Namaste! I'm TraveAI, your friendly AI travel companion and India expert! I'm passionate about helping travelers discover the incredible diversity of India, especially the beautiful states of Goa and Karnataka.

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

Feel free to ask me anything about traveling in India! 🇮🇳"""
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash").with_max_tokens(2048)
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Save chat history with enhanced metadata
        chat_data = {
            "session_id": request.session_id,
            "user_message": request.message,
            "ai_response": response,
            "timestamp": datetime.utcnow(),
            "ai_model": "gemini-2.0-flash",
            "message_length": len(request.message),
            "response_length": len(response),
            "conversation_context": "travel_assistance"
        }
        
        await db.chat_history.insert_one(chat_data)
        
        return ChatResponse(response=response, session_id=request.session_id)
        
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sorry, I encountered an issue. Let's try again! 🤖")

@api_router.get("/itineraries/{session_id}")
async def get_user_itineraries(session_id: str):
    try:
        itineraries = await db.itineraries.find({"session_id": session_id}).to_list(100)
        return [
            {
                "id": str(itinerary["_id"]),
                "destination": itinerary.get("destination"),
                "duration": itinerary.get("duration"),
                "user_request": itinerary.get("user_request"),
                "generated_itinerary": itinerary.get("generated_itinerary"),
                "created_at": itinerary.get("created_at"),
                "travel_style": itinerary.get("travel_style"),
                "interests": itinerary.get("interests", [])
            }
            for itinerary in itineraries
        ]
    except Exception as e:
        logging.error(f"Error fetching itineraries: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch your travel memories: {str(e)}")

@api_router.get("/chat-history/{session_id}")
async def get_chat_history(session_id: str, limit: int = 50):
    try:
        chat_history = await db.chat_history.find(
            {"session_id": session_id}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return [
            {
                "user_message": chat.get("user_message"),
                "ai_response": chat.get("ai_response"),
                "timestamp": chat.get("timestamp")
            }
            for chat in reversed(chat_history)  # Reverse to get chronological order
        ]
    except Exception as e:
        logging.error(f"Error fetching chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch conversation history: {str(e)}")

# Enhanced destinations endpoint with more detailed information
@api_router.get("/destinations")
async def get_popular_destinations():
    destinations = [
        {
            "name": "Goa",
            "type": "Beach Paradise",
            "highlights": ["Pristine beaches", "Portuguese heritage", "Vibrant nightlife", "Water sports"],
            "best_time": "November to March",
            "avg_budget": "₹2,000-5,000/day",
            "image_hint": "golden beaches, palm trees"
        },
        {
            "name": "Bangalore",
            "type": "Garden City",
            "highlights": ["IT hub", "Pleasant climate", "Craft breweries", "Modern culture"],
            "best_time": "October to February",
            "avg_budget": "₹1,500-4,000/day",
            "image_hint": "urban skyline, gardens"
        },
        {
            "name": "Mysore",
            "type": "Heritage City",
            "highlights": ["Royal palaces", "Silk sarees", "Yoga centers", "Classical architecture"],
            "best_time": "October to March",
            "avg_budget": "₹1,200-3,000/day",
            "image_hint": "palace, heritage architecture"
        },
        {
            "name": "Coorg",
            "type": "Scotland of India",
            "highlights": ["Coffee plantations", "Misty hills", "Adventure sports", "Wildlife"],
            "best_time": "October to March",
            "avg_budget": "₹2,000-4,500/day",
            "image_hint": "coffee plantations, hills"
        },
        {
            "name": "Hampi",
            "type": "UNESCO World Heritage",
            "highlights": ["Ancient ruins", "Boulder landscapes", "Historical significance", "Photography"],
            "best_time": "October to February",
            "avg_budget": "₹800-2,500/day",
            "image_hint": "ancient ruins, boulders"
        },
        {
            "name": "Gokarna",
            "type": "Spiritual Beach Town",
            "highlights": ["Pristine beaches", "Temple town", "Hippie culture", "Trekking"],
            "best_time": "November to March",
            "avg_budget": "₹1,000-3,000/day",
            "image_hint": "beaches, temples"
        }
    ]
    
    return {
        "destinations": destinations,
        "total_count": len(destinations),
        "featured_states": ["Goa", "Karnataka"],
        "travel_tip": "🌟 Each destination offers unique experiences - from beach relaxation to cultural immersion!"
    }

# Health check with enhanced information
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "TraveAI API",
        "version": "1.0.0",
        "ai_model": "gemini-2.0-flash",
        "features_active": ["itinerary_generation", "chat_assistant", "destination_info"],
        "uptime": "Running smoothly! 🚀",
        "message": "Ready to plan your next adventure! ✈️"
    }

# Include the router in the main app
app.include_router(api_router)

# Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Configure enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - 🚀 %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🌟 TraveAI Backend is starting up!")
    logger.info("🤖 AI Models: Gemini 2.0 Flash")
    logger.info("🗄️ Database: MongoDB Connected")
    logger.info("✅ Ready to help travelers explore India!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("👋 TraveAI Backend is shutting down gracefully...")
    client.close()
    logger.info("✅ Database connections closed!")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "🙏 Welcome to TraveAI!",
        "description": "Your AI-powered travel companion for exploring incredible India",
        "api_docs": "/docs",
        "version": "1.0.0",
        "status": "🚀 Ready for adventure!"
    }