import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Send, 
  Sparkles,
  Mountain,
  Palmtree,
  Camera,
  Users,
  Star,
  ArrowRight,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [formData, setFormData] = useState({
    destination: '',
    duration: 3,
    budget: '',
    interests: [],
    travel_style: 'balanced'
  });
  const [generatedItinerary, setGeneratedItinerary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2));
  const chatEndRef = useRef(null);

  const interests = [
    'Adventure Sports', 'Beach Activities', 'Cultural Heritage', 'Food & Cuisine',
    'Photography', 'Wildlife', 'Trekking', 'Water Sports', 'Local Markets', 'Nightlife'
  ];

  const destinations = [
    'Goa', 'Bangalore', 'Mysore', 'Coorg', 'Hampi', 'Gokarna', 
    'Chikmagalur', 'Udupi', 'Ooty', 'Pondicherry'
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateItinerary = async () => {
    if (!formData.destination) {
      toast.error('Please select a destination');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/generate-itinerary`, {
        destination: formData.destination,
        duration: parseInt(formData.duration),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        interests: formData.interests,
        travel_style: formData.travel_style,
        session_id: sessionId
      });
      
      setGeneratedItinerary(response.data.generated_itinerary);
      toast.success('Itinerary generated successfully!');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error('Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        session_id: sessionId
      });
      
      setChatMessages(prev => [...prev, { type: 'ai', content: response.data.response }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages(prev => [...prev, { type: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
      toast.error('Failed to send message');
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-3 rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  TraveAI
                </h1>
                <p className="text-gray-600 text-sm">Discover India's Hidden Gems</p>
              </div>
            </motion.div>
            
            <nav className="flex space-x-6">
              {['planner', 'chat'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  {tab === 'planner' ? (
                    <span className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Trip Planner</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>AI Assistant</span>
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-yellow-600/10"></div>
        <motion.div 
          className="relative max-w-7xl mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Plan Your Perfect
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent"> Indian Adventure</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover hidden gems in Goa & Karnataka with AI-powered itineraries, 
            local insights, and budget-friendly recommendations
          </p>
          
          {/* Feature Icons */}
          <div className="flex justify-center space-x-8 mb-12">
            {[
              { icon: Mountain, text: "Adventure" },
              { icon: Palmtree, text: "Beaches" },
              { icon: Camera, text: "Culture" },
              { icon: Users, text: "Local Guides" }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex flex-col items-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-white p-4 rounded-full shadow-lg border-2 border-orange-200">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-gray-700 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Hero Images */}
        <div className="flex justify-center space-x-8 mb-8">
          <motion.img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxJbmRpYSUyMHRyYXZlbHxlbnwwfHx8fDE3NTQxNDk5NDB8MA&ixlib=rb-4.1.0&q=85"
            alt="India Travel"
            className="w-64 h-40 object-cover rounded-2xl shadow-2xl border-4 border-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          />
          <motion.img
            src="https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxHb2ElMjBiZWFjaGVzfGVufDB8fHx8MTc1NDE0OTk0Nnww&ixlib=rb-4.1.0&q=85"
            alt="Goa Beaches"
            className="w-64 h-40 object-cover rounded-2xl shadow-2xl border-4 border-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Trip Planner Form */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 text-orange-500 mr-2" />
                  Plan Your Journey
                </h3>
                
                {/* Destination Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Destination</label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select a destination</option>
                    {destinations.map(dest => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Duration (days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    className="w-full p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Budget */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Budget (₹) - Optional</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="Enter your budget"
                    className="w-full p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Travel Style */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Travel Style</label>
                  <select
                    name="travel_style"
                    value={formData.travel_style}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="budget">Budget Traveler</option>
                    <option value="balanced">Balanced</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                {/* Interests */}
                <div className="mb-8">
                  <label className="block text-gray-700 font-medium mb-3">Interests</label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`p-2 rounded-lg text-sm transition-all duration-300 ${
                          formData.interests.includes(interest)
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                            : 'bg-orange-50 text-gray-700 hover:bg-orange-100'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  onClick={generateItinerary}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Perfect Trip...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Itinerary
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Generated Itinerary */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  Your Personalized Itinerary
                </h3>
                
                {generatedItinerary ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose max-w-none"
                  >
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-2 border-orange-200">
                      <pre className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed">
                        {generatedItinerary}
                      </pre>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Your AI-generated itinerary will appear here
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Fill out the form and click "Generate Itinerary" to get started!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <MessageSquare className="w-6 h-6 mr-2" />
                    Chat with TraveAI Assistant
                  </h3>
                  <p className="text-orange-100 mt-1">
                    Ask me anything about traveling in Goa & Karnataka!
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        Hi! I'm your AI travel assistant
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Ask me about destinations, activities, or travel tips for Goa & Karnataka!
                      </p>
                    </div>
                  )}
                  
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-2 max-w-xs lg:max-w-md ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500' 
                            : 'bg-gray-200'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div className={`p-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <pre className="whitespace-pre-wrap font-medium text-sm leading-relaxed">
                            {message.content}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isChatting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t border-orange-100 p-6">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about destinations, activities, budget tips..."
                      className="flex-1 p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      disabled={isChatting}
                    />
                    <motion.button
                      onClick={sendChatMessage}
                      disabled={isChatting || !chatInput.trim()}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;