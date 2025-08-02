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
  Loader2,
  Menu,
  X,
  LogOut,
  Settings,
  TrendingUp,
  Target,
  Globe,
  Zap,
  Shield,
  Moon,
  Sun
} from 'lucide-react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton,
  useUser,
  useAuth
} from '@clerk/clerk-react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for dark mode preference, default to false
    const saved = localStorage.getItem('traveai-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
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
  const { user } = useUser();
  const { getToken } = useAuth();

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('traveai-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

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

  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const token = await getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black dark' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: darkMode ? 'dark-toast' : '',
          style: darkMode ? {
            background: '#374151',
            color: '#f3f4f6',
          } : {}
        }}
      />
      
      {/* Enhanced Header */}
      <header className={`backdrop-blur-lg shadow-xl sticky top-0 z-50 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900/80 border-b border-gray-700' 
          : 'bg-white/80 border-b border-indigo-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  TraveAI
                </h1>
                <p className="text-slate-600 text-sm font-medium">Your Intelligent Travel Companion</p>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {['planner', 'chat', 'dashboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {tab === 'planner' ? (
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Smart Planner</span>
                    </span>
                  ) : tab === 'chat' ? (
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>AI Assistant</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Dashboard</span>
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-700 font-medium hidden sm:block">
                    Welcome, {user?.firstName}!
                  </span>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10 rounded-full shadow-lg border-2 border-indigo-200"
                      }
                    }}
                  />
                </div>
              </SignedIn>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-indigo-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4 border-t border-indigo-100"
              >
                <div className="flex flex-col space-y-2 pt-4">
                  {['planner', 'chat', 'dashboard'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-4 py-3 rounded-lg font-semibold text-left transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-slate-600 hover:bg-indigo-50'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-10"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full opacity-10"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <motion.div 
          className="relative max-w-7xl mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-6xl font-bold text-slate-800 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Plan Your Perfect
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Journey
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover hidden gems in India with personalized AI itineraries, smart budget planning, 
            and real-time local insights that make every journey extraordinary.
          </motion.p>
          
          {/* Enhanced Feature Icons */}
          <motion.div 
            className="flex justify-center flex-wrap gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: Zap, text: "AI-Powered", color: "from-yellow-400 to-orange-500" },
              { icon: Shield, text: "Safe Travel", color: "from-green-400 to-emerald-500" },
              { icon: Globe, text: "Local Insights", color: "from-blue-400 to-cyan-500" },
              { icon: Target, text: "Personalized", color: "from-purple-400 to-pink-500" }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex flex-col items-center space-y-3 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-slate-700 font-semibold">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Enhanced Hero Images */}
        <motion.div 
          className="flex justify-center flex-wrap gap-8 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {[
            "https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxJbmRpYSUyMHRyYXZlbHxlbnwwfHx8fDE3NTQxNDk5NDB8MA&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxHb2ElMjBiZWFjaGVzfGVufDB8fHx8MTc1NDE0OTk0Nnww&ixlib=rb-4.1.0&q=85",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmR8ZW58MHx8fHwxNzU0MTUyMDQ5fDA&ixlib=rb-4.1.0&q=85"
          ].map((src, index) => (
            <motion.img
              key={index}
              src={src}
              alt={`Travel destination ${index + 1}`}
              className="w-72 h-48 object-cover rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 1 + index * 0.2 }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* Enhanced Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {/* Enhanced Trip Planner Form */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-indigo-100">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <Target className="w-6 h-6 text-indigo-600 mr-3" />
                  Smart Trip Planner
                </h3>
                
                {/* Destination Selection */}
                <div className="mb-6">
                  <label className="block text-slate-700 font-semibold mb-3">Dream Destination</label>
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                  >
                    <option value="">Choose your adventure</option>
                    {destinations.map(dest => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-slate-700 font-semibold mb-3">Journey Duration (days)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="30"
                      className="w-full p-4 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                {/* Budget */}
                <div className="mb-6">
                  <label className="block text-slate-700 font-semibold mb-3">Budget (₹) - Optional</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="Your travel budget"
                      className="w-full p-4 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                    />
                    <DollarSign className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                {/* Travel Style */}
                <div className="mb-6">
                  <label className="block text-slate-700 font-semibold mb-3">Travel Style</label>
                  <select
                    name="travel_style"
                    value={formData.travel_style}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                  >
                    <option value="budget">Budget Explorer</option>
                    <option value="balanced">Balanced Traveler</option>
                    <option value="luxury">Luxury Experience</option>
                  </select>
                </div>

                {/* Interests */}
                <div className="mb-8">
                  <label className="block text-slate-700 font-semibold mb-3">What excites you?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {interests.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.interests.includes(interest)
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                            : 'bg-indigo-50 text-slate-700 hover:bg-indigo-100 border border-indigo-200'
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
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Your Perfect Journey...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Itinerary
                    </span>
                  )}
                  
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>

              {/* Enhanced Generated Itinerary */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-indigo-100">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-3" />
                  Your Personalized Journey
                </h3>
                
                {generatedItinerary ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="prose max-w-none"
                  >
                    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 shadow-inner">
                      <pre className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-sm">
                        {generatedItinerary}
                      </pre>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Save Itinerary
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotateX: [0, 10, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MapPin className="w-20 h-20 text-indigo-300 mx-auto mb-6" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-slate-600 mb-2">Ready for Adventure?</h4>
                    <p className="text-slate-500 text-lg">
                      Your AI-powered itinerary will appear here
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      Fill out the form and let our AI create magic!
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
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
                {/* Enhanced Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Bot className="w-7 h-7 mr-3" />
                    TraveAI Assistant
                  </h3>
                  <p className="text-indigo-100 mt-2 text-lg">
                    Your personal travel expert for India's hidden gems!
                  </p>
                </div>

                {/* Enhanced Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-indigo-50">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Bot className="w-20 h-20 text-indigo-300 mx-auto mb-6" />
                      </motion.div>
                      <h4 className="text-xl font-bold text-slate-600 mb-2">
                        🙏 Namaste! I'm your AI Travel Guide
                      </h4>
                      <p className="text-slate-500 text-lg max-w-md mx-auto">
                        Ask me about destinations, local culture, hidden gems, or travel tips for incredible India!
                      </p>
                    </div>
                  )}
                  
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-3 max-w-xs lg:max-w-md ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg' 
                            : 'bg-gradient-to-r from-slate-200 to-slate-300'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-lg ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                            : 'bg-white text-slate-700 border border-indigo-100'
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
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-indigo-100">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-indigo-400 rounded-full"
                                animate={{ 
                                  scale: [1, 1.3, 1],
                                  opacity: [0.7, 1, 0.7]
                                }}
                                transition={{ 
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.1
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Enhanced Chat Input */}
                <div className="border-t border-indigo-100 p-6 bg-white/50">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about destinations, culture, food, or travel tips..."
                      className="flex-1 p-4 border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                      disabled={isChatting}
                    />
                    <motion.button
                      onClick={sendChatMessage}
                      disabled={isChatting || !chatInput.trim()}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <SignedIn>
                {/* Dashboard Header */}
                <div className="text-center mb-12">
                  <motion.h2 
                    className="text-4xl font-bold text-slate-800 mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome back, {user?.firstName}! 🎉
                  </motion.h2>
                  <p className="text-xl text-slate-600">Your travel journey at a glance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {[
                    { title: "Trips Planned", value: "12", icon: MapPin, color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                    { title: "Countries Visited", value: "3", icon: Globe, color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
                    { title: "AI Recommendations", value: "48", icon: Sparkles, color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`bg-gradient-to-br ${stat.bg} p-8 rounded-3xl shadow-xl border border-white/50 backdrop-blur-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-600 font-medium mb-2">{stat.title}</p>
                          <p className="text-4xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                        <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl shadow-lg`}>
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-indigo-100"
                >
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 text-indigo-600 mr-3" />
                    Recent Travel Activity
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { action: "Generated itinerary for Goa", time: "2 hours ago", icon: Target },
                      { action: "Saved budget plan for Kerala", time: "1 day ago", icon: DollarSign },
                      { action: "Discovered hidden gems in Hampi", time: "3 days ago", icon: Star }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors">
                        <div className="bg-indigo-100 p-3 rounded-full">
                          <activity.icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{activity.action}</p>
                          <p className="text-slate-500 text-sm">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </SignedIn>

              <SignedOut>
                <div className="text-center py-20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="w-20 h-20 text-indigo-300 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-slate-800 mb-4">Join the TraveAI Community</h3>
                    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                      Sign in to access your personalized dashboard, save itineraries, and unlock premium AI features.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <SignInButton mode="modal">
                        <motion.button 
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Sign In
                        </motion.button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <motion.button 
                          className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Create Account
                        </motion.button>
                      </SignUpButton>
                    </div>
                  </motion.div>
                </div>
              </SignedOut>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;