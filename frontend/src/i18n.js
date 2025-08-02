import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources for major Indian languages
const resources = {
  en: {
    translation: {
      // App Header
      appTitle: "TraveAI",
      appSubtitle: "Your Intelligent Travel Companion",
      
      // Navigation
      smartPlanner: "Smart Planner",
      aiAssistant: "AI Assistant",
      dashboard: "Dashboard",
      routeAnalysis: "Route Analysis",
      
      // Auth
      signIn: "Sign In",
      getStarted: "Get Started",
      welcome: "Welcome",
      
      // Smart Planner
      dreamDestination: "Dream Destination",
      chooseAdventure: "Choose your adventure",
      journeyDuration: "Journey Duration (days)",
      budget: "Budget (₹) - Optional",
      yourBudget: "Your travel budget",
      travelStyle: "Travel Style",
      budgetExplorer: "Budget Explorer",
      balancedTraveler: "Balanced Traveler",
      luxuryExperience: "Luxury Experience",
      whatExcites: "What excites you?",
      generateItinerary: "Generate AI Itinerary",
      creatingJourney: "Creating Your Perfect Journey...",
      personalizedJourney: "Your Personalized Journey",
      
      // Route Analysis
      routePlannerTitle: "Smart Route Planner",
      fromLocation: "From Location",
      toLocation: "To Location",
      travelDate: "Travel Date",
      analyzeRoutes: "Analyze Best Routes",
      analyzingRoutes: "Analyzing Routes...",
      bestRoutes: "Best Travel Routes",
      
      // Chat
      chatTitle: "TraveAI Assistant",
      chatSubtitle: "Your personal travel expert for India's hidden gems!",
      chatPlaceholder: "Ask about destinations, culture, food, or travel tips...",
      chatWelcome: "🙏 Namaste! I'm your AI Travel Guide",
      chatIntro: "Ask me about destinations, local culture, hidden gems, or travel tips for incredible India!",
      
      // Dashboard
      welcomeBack: "Welcome back",
      dashboardSubtitle: "Your travel journey at a glance",
      tripsPlanned: "Trips Planned",
      countriesVisited: "Countries Visited",
      aiRecommendations: "AI Recommendations",
      recentActivity: "Recent Travel Activity",
      
      // Hero Section
      heroTitle: "Plan Your Perfect",
      heroSubtitle: "AI-Powered Journey",
      heroDescription: "Discover hidden gems in India with personalized AI itineraries, smart budget planning, and real-time local insights that make every journey extraordinary.",
      
      // Features
      aiPowered: "AI-Powered",
      safeTravel: "Safe Travel",
      localInsights: "Local Insights",
      personalized: "Personalized",
      
      // Common
      readyForAdventure: "Ready for Adventure?",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      
      // Interests
      adventureSports: "Adventure Sports",
      beachActivities: "Beach Activities",
      culturalHeritage: "Cultural Heritage",
      foodCuisine: "Food & Cuisine",
      photography: "Photography",
      wildlife: "Wildlife",
      trekking: "Trekking",
      waterSports: "Water Sports",
      localMarkets: "Local Markets",
      nightlife: "Nightlife",
      
      // Explore Section
      explore: "Explore",
      featuredOffers: "Featured Offers",
      upcomingEvents: "Upcoming Events",
      localVendors: "Local Vendors"
    }
  },
  hi: {
    translation: {
      // App Header
      appTitle: "ट्रैवलएआई",
      appSubtitle: "आपका बुद्धिमान यात्रा साथी",
      
      // Navigation
      smartPlanner: "स्मार्ट प्लानर",
      aiAssistant: "एआई सहायक",
      dashboard: "डैशबोर्ड",
      routeAnalysis: "मार्ग विश्लेषण",
      
      // Auth
      signIn: "साइन इन",
      getStarted: "शुरू करें",
      welcome: "स्वागत",
      
      // Smart Planner
      dreamDestination: "सपनों का गंतव्य",
      chooseAdventure: "अपना रोमांच चुनें",
      journeyDuration: "यात्रा की अवधि (दिन)",
      budget: "बजट (₹) - वैकल्पिक",
      yourBudget: "आपका यात्रा बजट",
      travelStyle: "यात्रा शैली",
      budgetExplorer: "बजट एक्सप्लोरर",
      balancedTraveler: "संतुलित यात्री",
      luxuryExperience: "लक्जरी अनुभव",
      whatExcites: "आपको क्या रोमांचित करता है?",
      generateItinerary: "एआई यात्रा कार्यक्रम बनाएं",
      creatingJourney: "आपकी परफेक्ट यात्रा बना रहे हैं...",
      personalizedJourney: "आपकी व्यक्तिगत यात्रा",
      
      // Route Analysis
      routePlannerTitle: "स्मार्ट रूट प्लानर",
      fromLocation: "कहाँ से",
      toLocation: "कहाँ तक",
      travelDate: "यात्रा तिथि",
      analyzeRoutes: "सर्वोत्तम मार्गों का विश्लेषण करें",
      analyzingRoutes: "मार्गों का विश्लेषण कर रहे हैं...",
      bestRoutes: "सर्वोत्तम यात्रा मार्ग",
      
      // Chat
      chatTitle: "ट्रैवलएआई सहायक",
      chatSubtitle: "भारत के छुपे हुए रत्नों के लिए आपका व्यक्तिगत यात्रा विशेषज्ञ!",
      chatPlaceholder: "गंतव्य, संस्कृति, भोजन या यात्रा सुझावों के बारे में पूछें...",
      chatWelcome: "🙏 नमस्ते! मैं आपका एआई यात्रा गाइड हूं",
      chatIntro: "अविश्वसनीय भारत के लिए गंतव्य, स्थानीय संस्कृति, छुपे हुए रत्न या यात्रा सुझावों के बारे में मुझसे पूछें!",
      
      // Dashboard
      welcomeBack: "वापसी पर स्वागत",
      dashboardSubtitle: "एक नजर में आपकी यात्रा",
      tripsPlanned: "नियोजित यात्राएं",
      countriesVisited: "देशों का दौरा",
      aiRecommendations: "एआई सिफारिशें",
      recentActivity: "हाल की यात्रा गतिविधि",
      
      // Hero Section
      heroTitle: "अपनी परफेक्ट योजना बनाएं",
      heroSubtitle: "एआई-संचालित यात्रा",
      heroDescription: "व्यक्तिगत एआई यात्रा कार्यक्रम, स्मार्ट बजट योजना और रियल-टाइम स्थानीय अंतर्दृष्टि के साथ भारत के छुपे हुए रत्नों की खोज करें।",
      
      // Features
      aiPowered: "एआई-संचालित",
      safeTravel: "सुरक्षित यात्रा",
      localInsights: "स्थानीय अंतर्दृष्टि",
      personalized: "व्यक्तिगत",
      
      // Common
      readyForAdventure: "रोमांच के लिए तैयार?",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता",
      cancel: "रद्द करें",
      save: "सेव करें",
      delete: "डिलीट करें",
      edit: "संपादित करें",
      
      // Interests
      adventureSports: "साहसिक खेल",
      beachActivities: "समुद्र तट गतिविधियां",
      culturalHeritage: "सांस्कृतिक विरासत",
      foodCuisine: "भोजन और व्यंजन",
      photography: "फोटोग्राफी",
      wildlife: "वन्यजीव",
      trekking: "ट्रेकिंग",
      waterSports: "जल खेल",
      localMarkets: "स्थानीय बाजार",
      nightlife: "नाइटलाइफ"
    }
  },
  ta: {
    translation: {
      // App Header
      appTitle: "ட்ராவலை",
      appSubtitle: "உங்கள் புத்திசாலித்தனமான பயண துணை",
      
      // Navigation
      smartPlanner: "ஸ்மார்ட் பிளானர்",
      aiAssistant: "ஏஐ உதவியாளர்",
      dashboard: "டாஷ்போர்டு",
      routeAnalysis: "வழித்தடம் பகுப்பாய்வு",
      
      // Smart Planner
      dreamDestination: "கனவு இலக்கு",
      chooseAdventure: "உங்கள் சாகசத்தை தேர்ந்தெடுங்கள்",
      journeyDuration: "பயண காலம் (நாட்கள்)",
      generateItinerary: "ஏஐ பயண திட்டம் உருவாக்கவும்",
      
      // Route Analysis
      routePlannerTitle: "ஸ்மார்ட் ரூட் பிளானர்",
      fromLocation: "எங்கிருந்து",
      toLocation: "எங்கு வரை",
      analyzeRoutes: "சிறந்த வழிகளை பகுப்பாய்வு செய்யவும்",
      
      // Chat
      chatTitle: "ட்ராவலை உதவியாளர்",
      chatWelcome: "🙏 வணக்கம்! நான் உங்கள் ஏஐ பயண வழிகாட்டி",
      
      // Common
      welcome: "வரவேற்கிறோம்",
      loading: "ஏற்றுகிறது...",
      signIn: "உள்நுழையவும்",
      getStarted: "தொடங்கவும்"
    }
  },
  te: {
    translation: {
      // App Header
      appTitle: "ట్రావెలై",
      appSubtitle: "మీ తెలివైన ప్రయాణ సహచరుడు",
      
      // Navigation
      smartPlanner: "స్మార్ట్ ప్లానర్",
      aiAssistant: "ఏఐ సహాయకుడు",
      dashboard: "డాష్‌బోర్డ్",
      routeAnalysis: "మార్గం విశ్లేషణ",
      
      // Smart Planner
      dreamDestination: "కల గమ్యం",
      chooseAdventure: "మీ సాహసం ఎంచుకోండి",
      journeyDuration: "ప్రయాణ వ్యవధి (రోజులు)",
      generateItinerary: "ఏఐ ప్రయాణ కార్యక్రమం రూపొందించండి",
      
      // Route Analysis
      routePlannerTitle: "స్మార్ట్ రూట్ ప్లానర్",
      fromLocation: "ఎక్కడ నుండి",
      toLocation: "ఎక్కడికి",
      analyzeRoutes: "ఉత్తమ మార్గాలను విశ్లేషించండి",
      
      // Chat
      chatTitle: "ట్రావెలై సహాయకుడు",
      chatWelcome: "🙏 నమస్కారం! నేను మీ ఏఐ ప్రయాణ గైడ్",
      
      // Common
      welcome: "స్వాగతం",
      loading: "లోడ్ అవుతోంది...",
      signIn: "సైన్ ఇన్",
      getStarted: "ప్రారంభించండి"
    }
  },
  bn: {
    translation: {
      // App Header
      appTitle: "ট্রাভেলএআই",
      appSubtitle: "আপনার বুদ্ধিমান ভ্রমণ সঙ্গী",
      
      // Navigation
      smartPlanner: "স্মার্ট প্ল্যানার",
      aiAssistant: "এআই সহায়ক",
      dashboard: "ড্যাশবোর্ড",
      routeAnalysis: "রুট বিশ্লেষণ",
      
      // Smart Planner
      dreamDestination: "স্বপ্নের গন্তব্য",
      chooseAdventure: "আপনার অ্যাডভেঞ্চার বেছে নিন",
      journeyDuration: "ভ্রমণের সময়কাল (দিন)",
      generateItinerary: "এআই ভ্রমণ পরিকল্পনা তৈরি করুন",
      
      // Chat
      chatTitle: "ট্রাভেলএআই সহায়ক",
      chatWelcome: "🙏 নমস্কার! আমি আপনার এআই ভ্রমণ গাইড",
      
      // Common
      welcome: "স্বাগতম",
      loading: "লোড হচ্ছে...",
      signIn: "সাইন ইন",
      getStarted: "শুরু করুন"
    }
  },
  kn: {
    translation: {
      // App Header
      appTitle: "ಟ್ರಾವೆಲೈ",
      appSubtitle: "ನಿಮ್ಮ ಬುದ್ಧಿವಂತ ಪ್ರಯಾಣ ಸಹಚರ",
      
      // Navigation
      smartPlanner: "ಸ್ಮಾರ್ಟ್ ಪ್ಲಾನರ್",
      aiAssistant: "ಎಐ ಸಹಾಯಕ",
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      routeAnalysis: "ಮಾರ್ಗ ವಿಶ್ಲೇಷಣೆ",
      
      // Auth
      signIn: "ಸೈನ್ ಇನ್",
      getStarted: "ಪ್ರಾರಂಭಿಸಿ",
      welcome: "ಸ್ವಾಗತ",
      
      // Smart Planner
      dreamDestination: "ಕನಸಿನ ತಲುಪುವ ಸ್ಥಳ",
      chooseAdventure: "ನಿಮ್ಮ ಸಾಹಸವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      journeyDuration: "ಪ್ರಯಾಣದ ಅವಧಿ (ದಿನಗಳು)",
      budget: "ಬಜೆಟ್ (₹) - ಐಚ್ಛಿಕ",
      yourBudget: "ನಿಮ್ಮ ಪ್ರಯಾಣದ ಬಜೆಟ್",
      travelStyle: "ಪ್ರಯಾಣ ಶೈಲಿ",
      budgetExplorer: "ಬಜೆಟ್ ಎಕ್ಸ್‌ಪ್ಲೋರರ್",
      balancedTraveler: "ಸಮತೋಲಿತ ಪ್ರಯಾಣಿಕ",
      luxuryExperience: "ಐಷಾರಾಮಿ ಅನುಭವ",
      whatExcites: "ನಿಮ್ಮನ್ನು ಏನು ರೋಮಾಂಚನಗೊಳಿಸುತ್ತದೆ?",
      generateItinerary: "ಎಐ ಪ್ರಯಾಣ ಕಾರ್ಯಕ್ರಮ ರಚಿಸಿ",
      creatingJourney: "ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಪ್ರಯಾಣವನ್ನು ರಚಿಸುತ್ತಿದ್ದೇವೆ...",
      personalizedJourney: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಯಾಣ",
      
      // Route Analysis
      routePlannerTitle: "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಯೋಜಕ",
      fromLocation: "ಎಲ್ಲಿಂದ",
      toLocation: "ಎಲ್ಲಿಗೆ",
      travelDate: "ಪ್ರಯಾಣ ದಿನಾಂಕ",
      analyzeRoutes: "ಅತ್ಯುತ್ತಮ ಮಾರ್ಗಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
      analyzingRoutes: "ಮಾರ್ಗಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇವೆ...",
      bestRoutes: "ಅತ್ಯುತ್ತಮ ಪ್ರಯಾಣ ಮಾರ್ಗಗಳು",
      
      // Chat
      chatTitle: "ಟ್ರಾವೆಲೈ ಸಹಾಯಕ",
      chatSubtitle: "ಭಾರತದ ಗುಪ್ತ ರತ್ನಗಳಿಗಾಗಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಯಾಣ ತಜ್ಞ!",
      chatPlaceholder: "ಗಮ್ಯಸ್ಥಾನಗಳು, ಸಂಸ್ಕೃತಿ, ಆಹಾರ ಅಥವಾ ಪ್ರಯಾಣ ಸಲಹೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
      chatWelcome: "🙏 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಎಐ ಟ್ರಾವೆಲ್ ಗೈಡ್",
      chatIntro: "ಅದ್ಭುತ ಭಾರತಕ್ಕಾಗಿ ಗಮ್ಯಸ್ಥಾನಗಳು, ಸ್ಥಳೀಯ ಸಂಸ್ಕೃತಿ, ಗುಪ್ತ ರತ್ನಗಳು ಅಥವಾ ಪ್ರಯಾಣ ಸಲಹೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ!",
      
      // Dashboard
      welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ",
      dashboardSubtitle: "ಒಂದು ನೋಟದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಯಾಣ",
      tripsPlanned: "ಯೋಜಿತ ಪ್ರವಾಸಗಳು",
      countriesVisited: "ದೇಶಗಳ ಭೇಟಿ",
      aiRecommendations: "ಎಐ ಶಿಫಾರಸುಗಳು",
      recentActivity: "ಇತ್ತೀಚಿನ ಪ್ರಯಾಣ ಚಟುವಟಿಕೆ",
      
      // Hero Section
      heroTitle: "ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಯೋಜನೆ",
      heroSubtitle: "ಎಐ-ಚಾಲಿತ ಪ್ರಯಾಣ",
      heroDescription: "ವೈಯಕ್ತಿಕ ಎಐ ಪ್ರಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳು, ಸ್ಮಾರ್ಟ್ ಬಜೆಟ್ ಯೋಜನೆ ಮತ್ತು ರಿಯಲ್-ಟೈಮ್ ಸ್ಥಳೀಯ ಒಳನೋಟಗಳೊಂದಿಗೆ ಭಾರತದ ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.",
      
      // Features
      aiPowered: "ಎಐ-ಚಾಲಿತ",
      safeTravel: "ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ",
      localInsights: "ಸ್ಥಳೀಯ ಒಳನೋಟಗಳು",
      personalized: "ವೈಯಕ್ತಿಕ",
      
      // Common
      readyForAdventure: "ಸಾಹಸಕ್ಕಾಗಿ ಸಿದ್ಧವೇ?",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      error: "ದೋಷ",
      success: "ಯಶಸ್ಸು",
      cancel: "ರದ್ದುಗೊಳಿಸಿ",
      save: "ಉಳಿಸಿ",
      delete: "ಅಳಿಸಿ",
      edit: "ಸಂಪಾದಿಸಿ",
      
      // Interests
      adventureSports: "ಸಾಹಸ ಕ್ರೀಡೆಗಳು",
      beachActivities: "ಸಮುದ್ರ ತೀರದ ಚಟುವಟಿಕೆಗಳು",
      culturalHeritage: "ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ",
      foodCuisine: "ಆಹಾರ ಮತ್ತು ಪಾಕಪದ್ಧತಿ",
      photography: "ಛಾಯಾಗ್ರಹಣ",
      wildlife: "ವನ್ಯಜೀವಿ",
      trekking: "ಟ್ರೆಕ್ಕಿಂಗ್",
      waterSports: "ಜಲ ಕ್ರೀಡೆಗಳು",
      localMarkets: "ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಗಳು",
      nightlife: "ರಾತ್ರಿ ಜೀವನ",
      
      // Explore Section
      explore: "ಅನ್ವೇಷಿಸಿ",
      featuredOffers: "ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಆಫರ್‌ಗಳು",
      upcomingEvents: "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳು",
      localVendors: "ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಿಗಳು"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;