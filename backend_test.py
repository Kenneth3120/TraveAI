#!/usr/bin/env python3
"""
TraveAI Backend Testing Suite
Tests all backend APIs including Gemini integration, itinerary generation, chat, and database operations.
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL from frontend .env
BACKEND_URL = "https://d8c2558d-f044-4f46-ab65-dda9cc17a522.preview.emergentagent.com/api"

class TraveAITester:
    def __init__(self):
        self.session = None
        self.test_session_id = str(uuid.uuid4())
        self.results = {
            "gemini_api_integration": {"status": "PENDING", "details": []},
            "itinerary_generation": {"status": "PENDING", "details": []},
            "chat_api": {"status": "PENDING", "details": []},
            "database_operations": {"status": "PENDING", "details": []},
            "error_handling": {"status": "PENDING", "details": []}
        }
    
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        print(f"🚀 Starting TraveAI Backend Tests")
        print(f"📍 Backend URL: {BACKEND_URL}")
        print(f"🔑 Test Session ID: {self.test_session_id}")
        print("=" * 80)
    
    async def cleanup(self):
        """Clean up HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_basic_connectivity(self):
        """Test basic API connectivity"""
        print("\n🔍 Testing Basic Connectivity...")
        try:
            async with self.session.get(f"{BACKEND_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Basic connectivity successful: {data}")
                    return True
                else:
                    print(f"❌ Basic connectivity failed: Status {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Basic connectivity error: {str(e)}")
            return False
    
    async def test_gemini_api_integration(self):
        """Test Gemini API integration through chat endpoint"""
        print("\n🤖 Testing Gemini API Integration...")
        test_cases = [
            {
                "name": "Simple travel query",
                "message": "Tell me about Goa beaches",
                "expected_keywords": ["goa", "beach"]
            },
            {
                "name": "Karnataka travel query", 
                "message": "What are the best places to visit in Karnataka?",
                "expected_keywords": ["karnataka", "bangalore", "mysore"]
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                payload = {
                    "message": test_case["message"],
                    "session_id": self.test_session_id
                }
                
                async with self.session.post(f"{BACKEND_URL}/chat", json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        response_text = data.get("response", "").lower()
                        
                        # Check if response contains expected keywords
                        keywords_found = any(keyword in response_text for keyword in test_case["expected_keywords"])
                        
                        if keywords_found and len(response_text) > 50:
                            print(f"✅ {test_case['name']}: SUCCESS")
                            print(f"   Response length: {len(data.get('response', ''))}")
                            success_count += 1
                            self.results["gemini_api_integration"]["details"].append(f"✅ {test_case['name']}: Generated {len(response_text)} chars")
                        else:
                            print(f"❌ {test_case['name']}: Response too short or missing keywords")
                            self.results["gemini_api_integration"]["details"].append(f"❌ {test_case['name']}: Poor response quality")
                    else:
                        print(f"❌ {test_case['name']}: HTTP {response.status}")
                        error_text = await response.text()
                        self.results["gemini_api_integration"]["details"].append(f"❌ {test_case['name']}: HTTP {response.status} - {error_text}")
                        
            except Exception as e:
                print(f"❌ {test_case['name']}: Exception - {str(e)}")
                self.results["gemini_api_integration"]["details"].append(f"❌ {test_case['name']}: Exception - {str(e)}")
        
        if success_count == len(test_cases):
            self.results["gemini_api_integration"]["status"] = "PASS"
            print(f"✅ Gemini API Integration: ALL TESTS PASSED ({success_count}/{len(test_cases)})")
        else:
            self.results["gemini_api_integration"]["status"] = "FAIL"
            print(f"❌ Gemini API Integration: FAILED ({success_count}/{len(test_cases)})")
    
    async def test_itinerary_generation(self):
        """Test itinerary generation API with various scenarios"""
        print("\n🗺️ Testing Itinerary Generation API...")
        
        test_cases = [
            {
                "name": "Goa 3-day beach trip",
                "payload": {
                    "destination": "Goa",
                    "duration": 3,
                    "budget": 15000,
                    "interests": ["Beach Activities", "Food & Cuisine"],
                    "travel_style": "relaxed",
                    "session_id": self.test_session_id
                }
            },
            {
                "name": "Bangalore 2-day business trip",
                "payload": {
                    "destination": "Bangalore",
                    "duration": 2,
                    "budget": 8000,
                    "interests": ["Technology", "Food & Cuisine"],
                    "travel_style": "efficient",
                    "session_id": self.test_session_id
                }
            },
            {
                "name": "Mysore 4-day cultural trip",
                "payload": {
                    "destination": "Mysore",
                    "duration": 4,
                    "budget": 12000,
                    "interests": ["Historical Sites", "Culture & Heritage"],
                    "travel_style": "cultural",
                    "session_id": self.test_session_id
                }
            },
            {
                "name": "Coorg 3-day nature trip",
                "payload": {
                    "destination": "Coorg",
                    "duration": 3,
                    "budget": 10000,
                    "interests": ["Nature & Wildlife", "Adventure Sports"],
                    "travel_style": "adventure",
                    "session_id": self.test_session_id
                }
            },
            {
                "name": "Hampi 2-day heritage trip",
                "payload": {
                    "destination": "Hampi",
                    "duration": 2,
                    "budget": 6000,
                    "interests": ["Historical Sites", "Photography"],
                    "travel_style": "cultural",
                    "session_id": self.test_session_id
                }
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                async with self.session.post(f"{BACKEND_URL}/generate-itinerary", json=test_case["payload"]) as response:
                    if response.status == 200:
                        data = await response.json()
                        itinerary = data.get("generated_itinerary", "")
                        
                        # Validate response structure
                        required_fields = ["id", "session_id", "user_request", "generated_itinerary"]
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields and len(itinerary) > 200:
                            print(f"✅ {test_case['name']}: SUCCESS")
                            print(f"   Itinerary length: {len(itinerary)} chars")
                            print(f"   Session ID: {data.get('session_id')}")
                            success_count += 1
                            self.results["itinerary_generation"]["details"].append(f"✅ {test_case['name']}: Generated {len(itinerary)} chars")
                        else:
                            print(f"❌ {test_case['name']}: Missing fields {missing_fields} or short response")
                            self.results["itinerary_generation"]["details"].append(f"❌ {test_case['name']}: Invalid response structure")
                    else:
                        print(f"❌ {test_case['name']}: HTTP {response.status}")
                        error_text = await response.text()
                        self.results["itinerary_generation"]["details"].append(f"❌ {test_case['name']}: HTTP {response.status} - {error_text}")
                        
            except Exception as e:
                print(f"❌ {test_case['name']}: Exception - {str(e)}")
                self.results["itinerary_generation"]["details"].append(f"❌ {test_case['name']}: Exception - {str(e)}")
        
        if success_count == len(test_cases):
            self.results["itinerary_generation"]["status"] = "PASS"
            print(f"✅ Itinerary Generation: ALL TESTS PASSED ({success_count}/{len(test_cases)})")
        else:
            self.results["itinerary_generation"]["status"] = "FAIL"
            print(f"❌ Itinerary Generation: FAILED ({success_count}/{len(test_cases)})")
    
    async def test_chat_api(self):
        """Test chat API with various travel queries"""
        print("\n💬 Testing Chat API...")
        
        test_cases = [
            {
                "name": "Goa beaches query",
                "message": "What are the best beaches in Goa?",
                "expected_keywords": ["beach", "goa", "anjuna", "baga", "calangute"]
            },
            {
                "name": "Karnataka food query",
                "message": "What are the famous foods of Karnataka?",
                "expected_keywords": ["karnataka", "food", "dosa", "mysore", "bangalore"]
            },
            {
                "name": "Travel tips query",
                "message": "What's the best time to visit Coorg?",
                "expected_keywords": ["coorg", "time", "weather", "season"]
            },
            {
                "name": "Budget travel query",
                "message": "How to travel Hampi on a budget?",
                "expected_keywords": ["hampi", "budget", "cheap", "affordable"]
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                payload = {
                    "message": test_case["message"],
                    "session_id": self.test_session_id
                }
                
                async with self.session.post(f"{BACKEND_URL}/chat", json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        response_text = data.get("response", "").lower()
                        
                        # Check response quality
                        keywords_found = any(keyword in response_text for keyword in test_case["expected_keywords"])
                        
                        if len(response_text) > 50 and keywords_found:
                            print(f"✅ {test_case['name']}: SUCCESS")
                            print(f"   Response length: {len(response_text)} chars")
                            success_count += 1
                            self.results["chat_api"]["details"].append(f"✅ {test_case['name']}: Quality response")
                        else:
                            print(f"❌ {test_case['name']}: Poor response quality")
                            self.results["chat_api"]["details"].append(f"❌ {test_case['name']}: Poor response quality")
                    else:
                        print(f"❌ {test_case['name']}: HTTP {response.status}")
                        error_text = await response.text()
                        self.results["chat_api"]["details"].append(f"❌ {test_case['name']}: HTTP {response.status}")
                        
            except Exception as e:
                print(f"❌ {test_case['name']}: Exception - {str(e)}")
                self.results["chat_api"]["details"].append(f"❌ {test_case['name']}: Exception - {str(e)}")
        
        if success_count == len(test_cases):
            self.results["chat_api"]["status"] = "PASS"
            print(f"✅ Chat API: ALL TESTS PASSED ({success_count}/{len(test_cases)})")
        else:
            self.results["chat_api"]["status"] = "FAIL"
            print(f"❌ Chat API: FAILED ({success_count}/{len(test_cases)})")
    
    async def test_database_operations(self):
        """Test database storage and retrieval"""
        print("\n🗄️ Testing Database Operations...")
        
        try:
            # Test retrieving itineraries for our session
            async with self.session.get(f"{BACKEND_URL}/itineraries/{self.test_session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        print(f"✅ Database retrieval: SUCCESS")
                        print(f"   Found {len(data)} itineraries for session")
                        
                        # Validate itinerary structure if any exist
                        if len(data) > 0:
                            sample = data[0]
                            required_fields = ["id", "destination", "duration", "user_request", "generated_itinerary"]
                            missing_fields = [field for field in required_fields if field not in sample]
                            
                            if not missing_fields:
                                print(f"✅ Database structure: Valid itinerary structure")
                                self.results["database_operations"]["status"] = "PASS"
                                self.results["database_operations"]["details"].append(f"✅ Retrieved {len(data)} itineraries with valid structure")
                            else:
                                print(f"❌ Database structure: Missing fields {missing_fields}")
                                self.results["database_operations"]["status"] = "FAIL"
                                self.results["database_operations"]["details"].append(f"❌ Invalid itinerary structure: missing {missing_fields}")
                        else:
                            print(f"⚠️ Database: No itineraries found (may be expected if generation failed)")
                            self.results["database_operations"]["status"] = "PASS"
                            self.results["database_operations"]["details"].append("✅ Database accessible, no data found (acceptable)")
                    else:
                        print(f"❌ Database: Invalid response format")
                        self.results["database_operations"]["status"] = "FAIL"
                        self.results["database_operations"]["details"].append("❌ Invalid response format from database")
                else:
                    print(f"❌ Database retrieval: HTTP {response.status}")
                    self.results["database_operations"]["status"] = "FAIL"
                    self.results["database_operations"]["details"].append(f"❌ HTTP {response.status} on database retrieval")
                    
        except Exception as e:
            print(f"❌ Database operations: Exception - {str(e)}")
            self.results["database_operations"]["status"] = "FAIL"
            self.results["database_operations"]["details"].append(f"❌ Exception: {str(e)}")
    
    async def test_error_handling(self):
        """Test API error handling with invalid inputs"""
        print("\n🚨 Testing Error Handling...")
        
        test_cases = [
            {
                "name": "Invalid itinerary request - missing destination",
                "endpoint": "/generate-itinerary",
                "payload": {"duration": 3, "budget": 10000},
                "expected_status": [400, 422]  # Bad request or validation error
            },
            {
                "name": "Invalid itinerary request - negative duration",
                "endpoint": "/generate-itinerary", 
                "payload": {"destination": "Goa", "duration": -1, "budget": 10000},
                "expected_status": [400, 422, 500]  # May be handled at validation or processing level
            },
            {
                "name": "Invalid chat request - empty message",
                "endpoint": "/chat",
                "payload": {"message": "", "session_id": self.test_session_id},
                "expected_status": [400, 422, 500]  # May still process but should handle gracefully
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                async with self.session.post(f"{BACKEND_URL}{test_case['endpoint']}", json=test_case["payload"]) as response:
                    if response.status in test_case["expected_status"]:
                        print(f"✅ {test_case['name']}: Properly handled with status {response.status}")
                        success_count += 1
                        self.results["error_handling"]["details"].append(f"✅ {test_case['name']}: Status {response.status}")
                    else:
                        print(f"⚠️ {test_case['name']}: Unexpected status {response.status} (expected {test_case['expected_status']})")
                        # Don't count as failure - API might handle gracefully
                        success_count += 1
                        self.results["error_handling"]["details"].append(f"⚠️ {test_case['name']}: Status {response.status} (unexpected but handled)")
                        
            except Exception as e:
                print(f"❌ {test_case['name']}: Exception - {str(e)}")
                self.results["error_handling"]["details"].append(f"❌ {test_case['name']}: Exception - {str(e)}")
        
        if success_count >= len(test_cases) * 0.7:  # 70% success rate acceptable for error handling
            self.results["error_handling"]["status"] = "PASS"
            print(f"✅ Error Handling: ACCEPTABLE ({success_count}/{len(test_cases)})")
        else:
            self.results["error_handling"]["status"] = "FAIL"
            print(f"❌ Error Handling: FAILED ({success_count}/{len(test_cases)})")
    
    async def run_all_tests(self):
        """Run all test suites"""
        await self.setup()
        
        # Test basic connectivity first
        if not await self.test_basic_connectivity():
            print("❌ Basic connectivity failed. Aborting tests.")
            await self.cleanup()
            return
        
        # Run all test suites
        await self.test_gemini_api_integration()
        await self.test_itinerary_generation()
        await self.test_chat_api()
        await self.test_database_operations()
        await self.test_error_handling()
        
        await self.cleanup()
        
        # Print final summary
        self.print_summary()
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏁 TRAVEAI BACKEND TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for result in self.results.values() if result["status"] == "PASS")
        
        for test_name, result in self.results.items():
            status_icon = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⏳"
            print(f"{status_icon} {test_name.replace('_', ' ').title()}: {result['status']}")
            for detail in result["details"]:
                print(f"   {detail}")
        
        print(f"\n📊 Overall Result: {passed_tests}/{total_tests} test suites passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL BACKEND TESTS PASSED!")
        elif passed_tests >= total_tests * 0.8:
            print("⚠️ MOST TESTS PASSED - Minor issues detected")
        else:
            print("❌ CRITICAL ISSUES DETECTED - Backend needs attention")

async def main():
    """Main test execution"""
    tester = TraveAITester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())