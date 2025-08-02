#!/usr/bin/env python3
"""
TraveAI Enhanced Endpoints Testing
Tests the new enhanced endpoints: /api/destinations, /api/itineraries/{session_id}, /api/chat-history/{session_id}, /api/health
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://d21241be-03cd-4dd1-b8d9-ad85d6c0f3a4.preview.emergentagent.com/api"

class EnhancedEndpointsTester:
    def __init__(self):
        self.session = None
        self.test_session_id = str(uuid.uuid4())
        
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        print(f"🚀 Testing TraveAI Enhanced Endpoints")
        print(f"📍 Backend URL: {BACKEND_URL}")
        print(f"🔑 Test Session ID: {self.test_session_id}")
        print("=" * 80)
    
    async def cleanup(self):
        """Clean up HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_health_endpoint(self):
        """Test /api/health endpoint"""
        print("\n🏥 Testing Health Endpoint...")
        try:
            async with self.session.get(f"{BACKEND_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["status", "service", "version", "ai_model", "features_active"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        print(f"✅ Health endpoint: SUCCESS")
                        print(f"   Status: {data.get('status')}")
                        print(f"   Service: {data.get('service')}")
                        print(f"   AI Model: {data.get('ai_model')}")
                        print(f"   Features: {data.get('features_active')}")
                        return True
                    else:
                        print(f"❌ Health endpoint: Missing fields {missing_fields}")
                        return False
                else:
                    print(f"❌ Health endpoint: HTTP {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Health endpoint: Exception - {str(e)}")
            return False
    
    async def test_destinations_endpoint(self):
        """Test /api/destinations endpoint"""
        print("\n🏖️ Testing Destinations Endpoint...")
        try:
            async with self.session.get(f"{BACKEND_URL}/destinations") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check response structure
                    required_fields = ["destinations", "total_count", "featured_states"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        destinations = data.get("destinations", [])
                        if len(destinations) > 0:
                            # Check destination structure
                            sample_dest = destinations[0]
                            dest_fields = ["name", "type", "highlights", "best_time", "avg_budget"]
                            missing_dest_fields = [field for field in dest_fields if field not in sample_dest]
                            
                            if not missing_dest_fields:
                                print(f"✅ Destinations endpoint: SUCCESS")
                                print(f"   Total destinations: {data.get('total_count')}")
                                print(f"   Featured states: {data.get('featured_states')}")
                                print(f"   Sample destination: {sample_dest.get('name')} - {sample_dest.get('type')}")
                                return True
                            else:
                                print(f"❌ Destinations endpoint: Missing destination fields {missing_dest_fields}")
                                return False
                        else:
                            print(f"❌ Destinations endpoint: No destinations found")
                            return False
                    else:
                        print(f"❌ Destinations endpoint: Missing fields {missing_fields}")
                        return False
                else:
                    print(f"❌ Destinations endpoint: HTTP {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Destinations endpoint: Exception - {str(e)}")
            return False
    
    async def test_session_endpoints(self):
        """Test session-specific endpoints after creating some data"""
        print("\n📝 Testing Session-Specific Endpoints...")
        
        # First, create some test data
        print("   Creating test itinerary...")
        itinerary_payload = {
            "destination": "Goa",
            "duration": 2,
            "budget": 8000,
            "interests": ["Beach Activities"],
            "travel_style": "balanced",
            "session_id": self.test_session_id
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/generate-itinerary", json=itinerary_payload) as response:
                if response.status != 200:
                    print(f"❌ Failed to create test itinerary: HTTP {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Failed to create test itinerary: {str(e)}")
            return False
        
        print("   Creating test chat...")
        chat_payload = {
            "message": "What are the best beaches in Goa?",
            "session_id": self.test_session_id
        }
        
        try:
            async with self.session.post(f"{BACKEND_URL}/chat", json=chat_payload) as response:
                if response.status != 200:
                    print(f"❌ Failed to create test chat: HTTP {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Failed to create test chat: {str(e)}")
            return False
        
        # Now test the retrieval endpoints
        success_count = 0
        
        # Test itineraries endpoint
        print("   Testing itineraries retrieval...")
        try:
            async with self.session.get(f"{BACKEND_URL}/itineraries/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) > 0:
                        sample_itinerary = data[0]
                        required_fields = ["id", "destination", "duration", "user_request", "generated_itinerary"]
                        missing_fields = [field for field in required_fields if field not in sample_itinerary]
                        
                        if not missing_fields:
                            print(f"✅ Itineraries retrieval: SUCCESS")
                            print(f"   Found {len(data)} itineraries")
                            success_count += 1
                        else:
                            print(f"❌ Itineraries retrieval: Missing fields {missing_fields}")
                    else:
                        print(f"❌ Itineraries retrieval: No data or invalid format")
                else:
                    print(f"❌ Itineraries retrieval: HTTP {response.status}")
        except Exception as e:
            print(f"❌ Itineraries retrieval: Exception - {str(e)}")
        
        # Test chat history endpoint
        print("   Testing chat history retrieval...")
        try:
            async with self.session.get(f"{BACKEND_URL}/chat-history/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) > 0:
                        sample_chat = data[0]
                        required_fields = ["user_message", "ai_response", "timestamp"]
                        missing_fields = [field for field in required_fields if field not in sample_chat]
                        
                        if not missing_fields:
                            print(f"✅ Chat history retrieval: SUCCESS")
                            print(f"   Found {len(data)} chat messages")
                            success_count += 1
                        else:
                            print(f"❌ Chat history retrieval: Missing fields {missing_fields}")
                    else:
                        print(f"❌ Chat history retrieval: No data or invalid format")
                else:
                    print(f"❌ Chat history retrieval: HTTP {response.status}")
        except Exception as e:
            print(f"❌ Chat history retrieval: Exception - {str(e)}")
        
        return success_count == 2
    
    async def run_all_tests(self):
        """Run all enhanced endpoint tests"""
        await self.setup()
        
        results = []
        results.append(await self.test_health_endpoint())
        results.append(await self.test_destinations_endpoint())
        results.append(await self.test_session_endpoints())
        
        await self.cleanup()
        
        # Print summary
        print("\n" + "=" * 80)
        print("🏁 ENHANCED ENDPOINTS TEST SUMMARY")
        print("=" * 80)
        
        test_names = ["Health Endpoint", "Destinations Endpoint", "Session Endpoints"]
        passed_tests = sum(results)
        total_tests = len(results)
        
        for i, (test_name, result) in enumerate(zip(test_names, results)):
            status_icon = "✅" if result else "❌"
            print(f"{status_icon} {test_name}: {'PASS' if result else 'FAIL'}")
        
        print(f"\n📊 Overall Result: {passed_tests}/{total_tests} enhanced endpoint tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL ENHANCED ENDPOINT TESTS PASSED!")
            return True
        else:
            print("❌ SOME ENHANCED ENDPOINT TESTS FAILED")
            return False

async def main():
    """Main test execution"""
    tester = EnhancedEndpointsTester()
    return await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())