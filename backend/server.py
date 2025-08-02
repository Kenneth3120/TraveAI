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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Gemini API Key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Define Models
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

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "TraveAI Backend is running!"}

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
        # Create system message for travel planning
        system_message = """You are TraveAI, an expert travel planner specializing in Goa and Karnataka destinations. 
        You help travelers discover both popular and off-beat destinations, create detailed day-by-day itineraries, 
        and provide budget-aware recommendations. Focus on:
        
        1. Include both well-known and hidden gems
        2. Provide specific local attractions, restaurants, and experiences
        3. Include approximate costs and budget breakdowns
        4. Suggest local transportation options
        5. Add cultural insights and tips
        6. Consider the traveler's interests and style
        7. Format responses in a clear, day-by-day structure
        
        Always be enthusiastic about promoting responsible tourism and supporting local communities."""
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash").with_max_tokens(4096)
        
        # Create user message
        interests_str = ", ".join(request.interests) if request.interests else "general sightseeing"
        budget_str = f" with a budget of ₹{request.budget}" if request.budget else ""
        
        user_message = UserMessage(
            text=f"Create a detailed {request.duration}-day itinerary for {request.destination}. "
                 f"My interests include: {interests_str}. Travel style: {request.travel_style}{budget_str}. "
                 f"Please include day-by-day activities, local attractions, food recommendations, "
                 f"approximate costs, and transportation tips."
        )
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Save to database
        itinerary_data = {
            "session_id": request.session_id,
            "user_request": f"{request.duration}-day trip to {request.destination}",
            "destination": request.destination,
            "duration": request.duration,
            "budget": request.budget,
            "interests": request.interests,
            "travel_style": request.travel_style,
            "generated_itinerary": response,
            "created_at": datetime.utcnow()
        }
        
        result = await db.itineraries.insert_one(itinerary_data)
        itinerary_data["id"] = str(result.inserted_id)
        
        return ItineraryResponse(
            id=str(result.inserted_id),
            session_id=request.session_id,
            user_request=itinerary_data["user_request"],
            generated_itinerary=response
        )
        
    except Exception as e:
        logging.error(f"Error generating itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        # Create system message for general travel chat
        system_message = """You are TraveAI, a friendly travel assistant specializing in Goa and Karnataka. 
        Help users with travel questions, destination recommendations, local insights, and trip planning.
        Be conversational, helpful, and enthusiastic about promoting responsible tourism."""
        
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
        
        # Save chat history
        chat_data = {
            "session_id": request.session_id,
            "user_message": request.message,
            "ai_response": response,
            "timestamp": datetime.utcnow()
        }
        
        await db.chat_history.insert_one(chat_data)
        
        return ChatResponse(response=response, session_id=request.session_id)
        
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

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
                "created_at": itinerary.get("created_at")
            }
            for itinerary in itineraries
        ]
    except Exception as e:
        logging.error(f"Error fetching itineraries: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch itineraries: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()