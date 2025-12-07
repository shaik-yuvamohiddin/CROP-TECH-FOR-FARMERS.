import React from 'react';
import { Sprout, Globe } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const t = translations[language];

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
  ];

  return (
    <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-full">
            <Sprout className="h-6 w-6 text-emerald-700" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{t.appTitle}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-emerald-100 hidden md:block">
            {t.tagline}
          </div>
          
          <div className="relative group">
            <div className="flex items-center space-x-1 bg-emerald-800/50 hover:bg-emerald-800 rounded-lg px-3 py-1.5 cursor-pointer transition-colors">
              <Globe className="h-4 w-4 text-emerald-100" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-4"
                style={{ backgroundImage: 'none' }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-gray-900">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;