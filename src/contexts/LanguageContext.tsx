import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  speak: (text: string) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  toggleVoiceMode: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: 'Home',
    browse: 'Browse',
    myItems: 'My Items',
    listItem: 'List Item',
    requests: 'Requests',
    messages: 'Messages',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    profile: 'Profile & Settings',
    heroTitle: 'Share Resources, Build Sustainable Communities',
    heroSub: 'Why buy when you can borrow? Access tools, equipment, camping gear, and appliances from verified neighbors while reducing waste.',
    browseMarketplace: 'Browse Marketplace',
    listItemNav: 'List Your Item',
    popularCategories: 'Popular Categories',
    availableNearby: 'Available Nearby',
    freshListingsSub: 'Explore items recently shared by community members',
    viewAll: 'View All Marketplace Items',
    voiceON: 'Voice Reader ON 🔊',
    voiceOFF: 'Voice Reader OFF 🔇',
    advancePayment: 'Advance Payment',
    deposit: 'Security Deposit',
    payNow: 'Pay Now',
  },
  hi: {
    home: 'होम',
    browse: 'खोजें',
    myItems: 'मेरे सामान',
    listItem: 'सामान जोड़ें',
    requests: 'अनुरोध',
    messages: 'संदेश',
    signIn: 'साइन इन करें',
    signOut: 'साइन आउट',
    profile: 'प्रोफ़ाइल एवं सेटिंग्स',
    heroTitle: 'संसाधन साझा करें, टिकाऊ समुदाय बनाएं',
    heroSub: 'जब आप उधार ले सकते हैं तो क्यों खरीदें? कचरा कम करते हुए पड़ोसियों से उपकरण, कैंपिंग गियर और घरेलू सामान प्राप्त करें।',
    browseMarketplace: 'मार्केटप्लेस देखें',
    listItemNav: 'अपना सामान लिस्ट करें',
    popularCategories: 'लोकप्रिय श्रेणियां',
    availableNearby: 'आसपास उपलब्ध सामान',
    freshListingsSub: 'समुदाय के सदस्यों द्वारा हाल ही में साझा किए गए सामान',
    viewAll: 'सभी सामान देखें',
    voiceON: 'आवाज़ मोड चालू 🔊',
    voiceOFF: 'आवाज़ मोड बंद 🔇',
    advancePayment: 'अग्रिम भुगतान',
    deposit: 'सुरक्षा राशि',
    payNow: 'अभी भुगतान करें',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('app_voice_enabled') === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('app_voice_enabled', String(voiceEnabled));
    if (!voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoiceMode = () => {
    setVoiceEnabled(prev => !prev);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  // Direct Text-to-Speech call
  const speak = (text: string) => {
    if (!text || text.trim() === '') return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Cancel any current speech instantly

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Natural speaking speed

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Click-to-Speak Listener: When voiceEnabled is true, read aloud whatever element the user clicks on
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!voiceEnabled) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      // Ignore clicking on voice toggle control itself
      if (target.closest('[data-voice-control]')) return;

      // Extract meaningful text from clicked element or its closest readable container
      const readableElement = target.closest('h1, h2, h3, h4, p, button, a, label, span, li') as HTMLElement;
      const textToRead = readableElement?.innerText || target.innerText || target.getAttribute('alt') || target.getAttribute('title');

      if (textToRead && textToRead.trim().length > 0) {
        speak(textToRead);
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, [voiceEnabled, language]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      speak,
      stopSpeech,
      isSpeaking,
      voiceEnabled,
      toggleVoiceMode
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
