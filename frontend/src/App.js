import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Sun,
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Route,
  Navigation,
  Clock,
  IndianRupee,
  Plane,
  Train,
  Bus,
  Car,
  Gift,
  Calendar as CalendarIcon,
  Store,
  Percent,
  Eye,
  Heart,
  Share2
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

// Language options with native names
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

// Travel Logo Component
const TravelLogo = ({ className = "w-8 h-8" }) => (
  <div className="relative">
    <img 
      src="https://images.unsplash.com/photo-1655642272518-05aaf7b8726e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBpY29ufGVufDB8fHxibHVlfDE3NTQxNzA2Mzd8MA&ixlib=rb-4.1.0&q=85"
      alt="TraveAI"
      className={`${className} rounded-full object-cover`}
    />
    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-1">
      <Sparkles className="w-3 h-3 text-white" />
    </div>
  </div>
);

// Speech Recognition Hook
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognition = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = 'en-IN';

    recognition.current.onstart = () => {
      setIsListening(true);
    };

    recognition.current.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.current.onend = () => {
      setIsListening(false);
    };

    recognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Speech recognition error. Please try again.');
    };

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognition.current && !isListening) {
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  };

  return { isListening, transcript, startListening, stopListening, setTranscript };
};

// Text-to-Speech Hook
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };

    updateVoices();
    speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const speak = (text, lang = 'en-IN') => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1;

      // Try to find a suitable voice
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error('Text-to-speech error');
      };

      speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};

function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('planner');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('traveai-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Planner state
  const [formData, setFormData] = useState({
    destination: '',
    duration: 3,
    budget: '',
    interests: [],
    travel_style: 'balanced'
  });
  const [generatedItinerary, setGeneratedItinerary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Route Analysis state
  const [routeData, setRouteData] = useState({
    from_location: '',
    to_location: '',
    travel_date: '',
    travel_mode: 'all'
  });
  const [routeAnalysis, setRouteAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Explore state
  const [exploreContent, setExploreContent] = useState(null);
  const [isLoadingExplore, setIsLoadingExplore] = useState(false);

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2));
  const chatEndRef = useRef(null);

  // Speech features
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

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

  // Handle speech recognition result
  useEffect(() => {
    if (transcript) {
      setChatInput(transcript);
      setTranscript('');
    }
  }, [transcript, setTranscript]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageMenu(false);
    toast.success(`Language changed to ${LANGUAGES.find(l => l.code === langCode)?.nativeName}`);
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

  const handleRouteInputChange = (e) => {
    const { name, value } = e.target;
    setRouteData(prev => ({
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

  const analyzeRoute = async () => {
    if (!routeData.from_location || !routeData.to_location) {
      toast.error('Please enter both from and to locations');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API}/analyze-route`, {
        from_location: routeData.from_location,
        to_location: routeData.to_location,
        travel_date: routeData.travel_date || null,
        travel_mode: routeData.travel_mode,
        session_id: sessionId
      });
      
      setRouteAnalysis(response.data);
      toast.success('Route analysis completed!');
    } catch (error) {
      console.error('Error analyzing route:', error);
      toast.error('Failed to analyze route. Please check location names.');
    } finally {
      setIsAnalyzing(false);
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
      
      const aiResponse = response.data.response;
      setChatMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages(prev => [...prev, { type: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
      toast.error('Failed to send message');
    } finally {
      setIsChatting(false);
    }
  };

  const loadExploreContent = async () => {
    setIsLoadingExplore(true);
    try {
      const response = await axios.get(`${API}/explore`);
      setExploreContent(response.data);
    } catch (error) {
      console.error('Error loading explore content:', error);
      toast.error('Failed to load explore content');
    } finally {
      setIsLoadingExplore(false);
    }
  };

  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await axios.get(`${API}/dashboard-stats?session_id=${sessionId}`);
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'explore' && !exploreContent) {
      loadExploreContent();
    }
    if (activeTab === 'dashboard' && !dashboardStats) {
      loadDashboardStats();
    }
  }, [activeTab]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const getTransportIcon = (mode) => {
    switch (mode.toLowerCase()) {
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      default: return <Navigation className="w-5 h-5" />;
    }
  };

  const getComfortColor = (comfort) => {
    switch (comfort.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'very good': return 'text-blue-600 bg-blue-100';
      case 'good': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900'
    }`}>
      {/* ElevenLabs ConvAI Widget */}
      <elevenlabs-convai agent-id="agent_4101k1p8rh7hfger6gxtadn88ccs"></elevenlabs-convai>
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
      <header className={`backdrop-blur-lg shadow-xl sticky top-0 z-50 transition-all duration-500 ${
        darkMode 
          ? 'bg-gray-900/90 border-b border-gray-700' 
          : 'bg-white/90 border-b border-indigo-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TravelLogo className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('appTitle')}
                </h1>
                <p className={`text-xs font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>{t('appSubtitle')}</p>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              {['planner', 'chat', 'explore', 'dashboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : `transition-colors duration-300 ${
                          darkMode 
                            ? 'text-gray-300 hover:text-indigo-400 hover:bg-gray-800' 
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                        }`
                  }`}
                >
                  {tab === 'planner' ? (
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>{t('smartPlanner')}</span>
                    </span>
                  ) : tab === 'chat' ? (
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{t('aiAssistant')}</span>
                    </span>
                  ) : tab === 'explore' ? (
                    <span className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>{t('explore')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>{t('dashboard')}</span>
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Controls Section */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-blue-400' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Languages className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl z-50 ${
                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            i18n.language === lang.code
                              ? 'bg-indigo-100 text-indigo-600'
                              : darkMode
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-50 text-gray-700'
                          } first:rounded-t-xl last:rounded-b-xl`}
                        >
                          <div className="font-medium">{lang.nativeName}</div>
                          <div className="text-sm opacity-60">{lang.name}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className={`p-3 rounded-full transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode ? 'text-gray-300 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'
                  }`}>
                    {t('signIn')}
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                    {t('getStarted')}
                  </button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <span className={`font-medium hidden sm:block ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    {t('welcome')}, {user?.firstName}!
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
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-indigo-50'
                }`}
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
                className={`md:hidden mt-4 pb-4 border-t ${
                  darkMode ? 'border-gray-700' : 'border-indigo-100'
                }`}
              >
                <div className="flex flex-col space-y-2 pt-4">
                  {['planner', 'chat', 'explore', 'dashboard'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-4 py-3 rounded-lg font-semibold text-left transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : darkMode 
                            ? 'text-gray-300 hover:bg-gray-800' 
                            : 'text-slate-600 hover:bg-indigo-50'
                      }`}
                    >
                      {tab === 'planner' ? t('smartPlanner') : 
                       tab === 'chat' ? t('aiAssistant') :
                       tab === 'explore' ? t('explore') : t('dashboard')}
                    </button>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Enhanced Main Content - No Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {t('smartPlanner')}
                </h2>
                <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                  Plan your perfect journey with AI-powered insights
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trip Planner Form */}
                <div className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gray-800/70 border-gray-700' 
                    : 'bg-white/70 border-indigo-100'
                }`}>
                  <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <Target className="w-6 h-6 text-indigo-600 mr-3" />
                    Itinerary Planner
                  </h3>
                  
                  <div className="mb-6">
                    <label className={`block font-semibold mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>{t('dreamDestination')}</label>
                    <select
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                        darkMode 
                          ? 'bg-gray-700/80 border-gray-600 text-white focus:border-indigo-400' 
                          : 'bg-white/80 border-indigo-200 focus:border-indigo-500'
                      }`}
                    >
                      <option value="">{t('chooseAdventure')}</option>
                      {destinations.map(dest => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className={`block font-semibold mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>{t('journeyDuration')}</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="1"
                        max="30"
                        className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                          darkMode 
                            ? 'bg-gray-700/80 border-gray-600 text-white focus:border-indigo-400' 
                            : 'bg-white/80 border-indigo-200 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>{t('budget')}</label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="₹ Optional"
                        className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                          darkMode 
                            ? 'bg-gray-700/80 border-gray-600 text-white focus:border-indigo-400' 
                            : 'bg-white/80 border-indigo-200 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className={`block font-semibold mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>{t('travelStyle')}</label>
                    <select
                      name="travel_style"
                      value={formData.travel_style}
                      onChange={handleInputChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                        darkMode 
                          ? 'bg-gray-700/80 border-gray-600 text-white focus:border-indigo-400' 
                          : 'bg-white/80 border-indigo-200 focus:border-indigo-500'
                      }`}
                    >
                      <option value="budget">{t('budgetExplorer')}</option>
                      <option value="balanced">{t('balancedTraveler')}</option>
                      <option value="luxury">{t('luxuryExperience')}</option>
                    </select>
                  </div>

                  <div className="mb-8">
                    <label className={`block font-semibold mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>{t('whatExcites')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            formData.interests.includes(interest)
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                : 'bg-indigo-50 text-slate-700 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={generateItinerary}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('creatingJourney')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t('generateItinerary')}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Route Analysis Form */}
                <div className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gray-800/70 border-gray-700' 
                    : 'bg-white/70 border-indigo-100'
                }`}>
                  <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <Route className="w-6 h-6 text-green-600 mr-3" />
                    Route Analyzer
                  </h3>
                  
                  <div className="mb-6">
                    <label className={`block font-semibold mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>From Location</label>
                    <input
                      type="text"
                      name="from_location"
                      value={routeData.from_location}
                      onChange={handleRouteInputChange}
                      placeholder="Enter starting location"
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                        darkMode 
                          ? 'bg-gray-700/80 border-gray-600 text-white focus:border-green-400' 
                          : 'bg-white/80 border-green-200 focus:border-green-500'
                      }`}
                    />
                  </div>

                  <div className="mb-6">
                    <label className={`block font-semibold mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>To Location</label>
                    <input
                      type="text"
                      name="to_location"
                      value={routeData.to_location}
                      onChange={handleRouteInputChange}
                      placeholder="Enter destination"
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                        darkMode 
                          ? 'bg-gray-700/80 border-gray-600 text-white focus:border-green-400' 
                          : 'bg-white/80 border-green-200 focus:border-green-500'
                      }`}
                    />
                  </div>

                  <div className="mb-6">
                    <label className={`block font-semibold mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>Travel Date (Optional)</label>
                    <input
                      type="date"
                      name="travel_date"
                      value={routeData.travel_date}
                      onChange={handleRouteInputChange}
                      className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${
                        darkMode 
                          ? 'bg-gray-700/80 border-gray-600 text-white focus:border-green-400' 
                          : 'bg-white/80 border-green-200 focus:border-green-500'
                      }`}
                    />
                  </div>

                  <motion.button
                    onClick={analyzeRoute}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Routes...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Navigation className="w-5 h-5 mr-2" />
                        Analyze Routes
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Results Section */}
              {(generatedItinerary || routeAnalysis) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Generated Itinerary */}
                  {generatedItinerary && (
                    <div className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border transition-all duration-500 ${
                      darkMode 
                        ? 'bg-gray-800/70 border-gray-700' 
                        : 'bg-white/70 border-indigo-100'
                    }`}>
                      <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <Star className="w-6 h-6 text-yellow-500 mr-3" />
                        Your Personalized Journey
                      </h3>
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="prose prose-lg max-w-none"
                      >
                        <div className={`p-6 rounded-2xl border-2 shadow-inner transition-all duration-500 ${
                          darkMode 
                            ? 'bg-gray-900/50 border-gray-600 prose-invert' 
                            : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200'
                        }`}>
                          <div className="mb-4 flex justify-end">
                            <button
                              onClick={() => isSpeaking ? stopSpeaking() : speak(generatedItinerary, i18n.language)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            className={`${darkMode ? 'text-gray-300' : 'text-slate-700'}`}
                          >
                            {generatedItinerary}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Route Analysis Results */}
                  {routeAnalysis && (
                    <div className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border transition-all duration-500 ${
                      darkMode 
                        ? 'bg-gray-800/70 border-gray-700' 
                        : 'bg-white/70 border-green-100'
                    }`}>
                      <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <Clock className="w-6 h-6 text-green-500 mr-3" />
                        Best Travel Routes
                      </h3>
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        {/* Route Summary */}
                        <div className={`p-4 rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-900/50 border-gray-600' 
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                        }`}>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distance: </span>
                              <span className="font-bold">{routeAnalysis.distance_km} km</span>
                            </div>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Est. Time: </span>
                              <span className="font-bold">{routeAnalysis.estimated_travel_time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Transport Options */}
                        <div className="space-y-4">
                          {routeAnalysis.transport_options.map((option, index) => (
                            <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                              darkMode 
                                ? 'bg-gray-900/30 border-gray-600 hover:border-gray-500' 
                                : 'bg-white/80 border-gray-200 hover:border-green-300'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                    {getTransportIcon(option.mode)}
                                  </div>
                                  <div>
                                    <h4 className={`font-bold capitalize ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                      {option.mode}
                                    </h4>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {option.duration}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getComfortColor(option.comfort_level)}`}>
                                    {option.comfort_level}
                                  </div>
                                  <p className={`text-sm font-bold mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {option.cost_range}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {option.recommendations.map((rec, recIndex) => (
                                  <p key={recIndex} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    • {rec}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
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
              <div className={`backdrop-blur-lg rounded-3xl shadow-2xl border overflow-hidden transition-all duration-500 ${
                darkMode 
                  ? 'bg-gray-800/70 border-gray-700' 
                  : 'bg-white/70 border-indigo-100'
              }`}>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Bot className="w-7 h-7 mr-3" />
                    {t('chatTitle')}
                  </h3>
                  <p className="text-indigo-100 mt-2 text-lg">
                    {t('chatSubtitle')}
                  </p>
                </div>

                {/* Chat Messages */}
                <div className={`h-96 overflow-y-auto p-6 space-y-6 transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-900 to-slate-900' 
                    : 'bg-gradient-to-br from-slate-50 to-indigo-50'
                }`}>
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
                        <Bot className={`w-20 h-20 mx-auto mb-6 ${
                          darkMode ? 'text-indigo-400' : 'text-indigo-300'
                        }`} />
                      </motion.div>
                      <h4 className={`text-xl font-bold mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        {t('chatWelcome')}
                      </h4>
                      <p className={`text-lg max-w-md mx-auto ${
                        darkMode ? 'text-gray-400' : 'text-slate-500'
                      }`}>
                        {t('chatIntro')}
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
                            : darkMode
                              ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                              : 'bg-gradient-to-r from-slate-200 to-slate-300'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                          )}
                        </div>
                        <div className={`relative rounded-2xl shadow-lg ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300 border border-gray-600'
                              : 'bg-white text-slate-700 border border-indigo-100'
                        }`}>
                          <div className="p-4">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              className="prose prose-sm max-w-none"
                              components={{
                                p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                li: ({children}) => <li className="mb-1">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                em: ({children}) => <em className="italic">{children}</em>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          
                          {/* TTS Button for AI messages */}
                          {message.type === 'ai' && (
                            <button
                              onClick={() => isSpeaking ? stopSpeaking() : speak(message.content, i18n.language)}
                              className={`absolute top-2 right-2 p-1 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                          )}
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          darkMode 
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
                            : 'bg-gradient-to-r from-slate-200 to-slate-300'
                        }`}>
                          <Bot className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                        </div>
                        <div className={`p-4 rounded-2xl shadow-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-indigo-100'
                        }`}>
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

                {/* Chat Input */}
                <div className={`border-t p-6 transition-all duration-500 ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700' 
                    : 'bg-white/50 border-indigo-100'
                }`}>
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chatPlaceholder')}
                        className={`w-full p-4 pr-12 border-2 rounded-2xl focus:outline-none transition-colors ${
                          darkMode 
                            ? 'bg-gray-700/80 border-gray-600 text-white focus:border-indigo-400' 
                            : 'bg-white/80 border-indigo-200 focus:border-indigo-500'
                        }`}
                        disabled={isChatting}
                      />
                      
                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                          isListening 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : darkMode
                              ? 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        disabled={isChatting}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                    
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
                  
                  {isListening && (
                    <p className={`text-sm mt-2 text-red-500 animate-pulse`}>
                      🎤 Listening... Speak now
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Explore Local Offers & Events
                </h2>
                <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                  Discover amazing deals and events from local vendors
                </p>
              </div>

              {isLoadingExplore ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                </div>
              ) : exploreContent ? (
                <div className="space-y-12">
                  {/* Featured Offers */}
                  {exploreContent.featured_offers && exploreContent.featured_offers.length > 0 && (
                    <section>
                      <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <Gift className="w-6 h-6 text-purple-600 mr-3" />
                        Featured Offers
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exploreContent.featured_offers.map((offer) => (
                          <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                              darkMode 
                                ? 'bg-gray-800/70 border-gray-700' 
                                : 'bg-white/80 border-indigo-100'
                            }`}
                          >
                            {offer.images && offer.images.length > 0 && (
                              <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 relative">
                                <img 
                                  src={`data:image/jpeg;base64,${offer.images[0]}`}
                                  alt={offer.title}
                                  className="w-full h-full object-cover"
                                />
                                {offer.discount_percentage && (
                                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {offer.discount_percentage}% OFF
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {offer.title}
                                  </h4>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                    by {offer.vendor_name}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'
                                }`}>
                                  {offer.category}
                                </span>
                              </div>
                              
                              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                {offer.description}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {offer.location}
                                  </span>
                                </div>
                                {offer.price && (
                                  <div className="text-right">
                                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                      ₹{offer.price}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                {offer.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className={`px-2 py-1 rounded-lg text-xs ${
                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-50 text-indigo-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Featured Events */}
                  {exploreContent.featured_events && exploreContent.featured_events.length > 0 && (
                    <section>
                      <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <CalendarIcon className="w-6 h-6 text-green-600 mr-3" />
                        Upcoming Events
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exploreContent.featured_events.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                              darkMode 
                                ? 'bg-gray-800/70 border-gray-700' 
                                : 'bg-white/80 border-green-100'
                            }`}
                          >
                            {event.images && event.images.length > 0 && (
                              <div className="h-48 bg-gradient-to-r from-green-400 to-emerald-400 relative">
                                <img 
                                  src={`data:image/jpeg;base64,${event.images[0]}`}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                  {event.event_type}
                                </div>
                              </div>
                            )}
                            <div className="p-6">
                              <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {event.title}
                              </h4>
                              
                              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                {event.description}
                              </p>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center space-x-2">
                                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                    {event.location}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                    Organized by {event.organizer}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {event.tags.map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className={`px-2 py-1 rounded-lg text-xs ${
                                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-green-50 text-green-600'
                                      }`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                {event.entry_fee !== null && (
                                  <div className="text-right">
                                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {event.entry_fee === 0 ? 'Free' : `₹${event.entry_fee}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recent Offers Quick View */}
                  {exploreContent.recent_offers && exploreContent.recent_offers.length > 0 && (
                    <section>
                      <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <Store className="w-6 h-6 text-blue-600 mr-3" />
                        Latest Deals
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {exploreContent.recent_offers.map((offer) => (
                          <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                              darkMode 
                                ? 'bg-gray-800/50 border-gray-700' 
                                : 'bg-white/60 border-blue-100'
                            }`}
                          >
                            <div className="text-center">
                              <h4 className={`font-bold text-sm mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {offer.title}
                              </h4>
                              <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                {offer.vendor_name}
                              </p>
                              {offer.discount_percentage && (
                                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold mb-2">
                                  {offer.discount_percentage}% OFF
                                </div>
                              )}
                              {offer.price && (
                                <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                  ₹{offer.price}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Store className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
                  <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                    No offers available yet
                  </h4>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    Check back soon for amazing deals from local vendors!
                  </p>
                </div>
              )}
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
                    className={`text-4xl font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-slate-800'
                    }`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {t('welcomeBack')}, {user?.firstName}! 🎉
                  </motion.h2>
                  <p className={`text-xl ${
                    darkMode ? 'text-gray-300' : 'text-slate-600'
                  }`}>{t('dashboardSubtitle')}</p>
                </div>

                {isLoadingStats ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                  </div>
                ) : dashboardStats ? (
                  <>
                    {/* Real-time Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                      {[
                        { 
                          title: t('tripsPlanned'), 
                          value: dashboardStats.user_stats.trips_planned, 
                          icon: MapPin, 
                          color: "from-blue-500 to-cyan-500", 
                          bg: darkMode ? "from-blue-900/30 to-cyan-900/30" : "from-blue-50 to-cyan-50" 
                        },
                        { 
                          title: t('countriesVisited'), 
                          value: dashboardStats.user_stats.countries_visited, 
                          icon: Globe, 
                          color: "from-green-500 to-emerald-500", 
                          bg: darkMode ? "from-green-900/30 to-emerald-900/30" : "from-green-50 to-emerald-50" 
                        },
                        { 
                          title: t('aiRecommendations'), 
                          value: dashboardStats.user_stats.ai_recommendations, 
                          icon: Sparkles, 
                          color: "from-purple-500 to-pink-500", 
                          bg: darkMode ? "from-purple-900/30 to-pink-900/30" : "from-purple-50 to-pink-50" 
                        }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className={`bg-gradient-to-br ${stat.bg} p-8 rounded-3xl shadow-xl border backdrop-blur-lg ${
                            darkMode ? 'border-gray-700' : 'border-white/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-slate-600'
                              }`}>{stat.title}</p>
                              <p className={`text-4xl font-bold ${
                                darkMode ? 'text-white' : 'text-slate-800'
                              }`}>{stat.value}</p>
                            </div>
                            <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl shadow-lg`}>
                              <stat.icon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Popular Destinations */}
                      {dashboardStats.popular_destinations && dashboardStats.popular_destinations.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-700' 
                              : 'bg-white/70 border-indigo-100'
                          }`}
                        >
                          <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                            darkMode ? 'text-white' : 'text-slate-800'
                          }`}>
                            <TrendingUp className="w-6 h-6 text-indigo-600 mr-3" />
                            Popular Destinations
                          </h3>
                          <div className="space-y-4">
                            {dashboardStats.popular_destinations.map((dest, index) => (
                              <div key={dest.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                    index === 0 ? 'bg-yellow-500' : 
                                    index === 1 ? 'bg-gray-400' : 
                                    index === 2 ? 'bg-orange-500' : 'bg-indigo-500'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                    {dest.name}
                                  </span>
                                </div>
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                  {dest.count} trips planned
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Global Statistics */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${
                          darkMode 
                            ? 'bg-gray-800/70 border-gray-700' 
                            : 'bg-white/70 border-indigo-100'
                        }`}
                      >
                        <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                          darkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                          <Globe className="w-6 h-6 text-green-600 mr-3" />
                          Community Stats
                        </h3>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {dashboardStats.global_stats.total_users}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Total Users</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
                              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {dashboardStats.global_stats.total_trips_planned}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Trips Planned</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
                              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {dashboardStats.global_stats.verified_vendors}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Verified Vendors</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-900/50' : 'bg-gradient-to-r from-orange-50 to-red-50'}`}>
                              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {dashboardStats.global_stats.active_offers}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Active Offers</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${
                        darkMode 
                          ? 'bg-gray-800/70 border-gray-700' 
                          : 'bg-white/70 border-indigo-100'
                      }`}
                    >
                      <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <Clock className="w-6 h-6 text-orange-600 mr-3" />
                        {t('recentActivity')}
                      </h3>
                      <div className="space-y-4">
                        {dashboardStats.recent_activity.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            className={`flex items-center space-x-4 p-4 rounded-2xl ${
                              darkMode ? 'bg-gray-900/30' : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                            }`}
                          >
                            <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                            <span className={`${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                              {activity}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <TrendingUp className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
                    <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                      Loading your dashboard...
                    </h4>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      We're gathering your travel statistics
                    </p>
                  </div>
                )}
              </SignedIn>

              <SignedOut>
                <div className="text-center py-20">
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
                    <Users className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-300'}`} />
                  </motion.div>
                  <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                    Sign in to view your dashboard
                  </h4>
                  <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    Track your travel planning progress and statistics
                  </p>
                  <SignInButton mode="modal">
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                      Sign In Now
                    </button>
                  </SignInButton>
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