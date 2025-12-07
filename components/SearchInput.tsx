import React, { useState } from 'react';
import { Search, MapPin, Locate, Loader2, Map as MapIcon } from 'lucide-react';
import { getPinFromCoordinates } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../utils/translations';
import MapPicker from './MapPicker';

interface SearchInputProps {
  onSearch: (query: string | { lat: number, lng: number }) => void;
  isLoading: boolean;
  language: Language;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading, language }) => {
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = query.trim();
    if (!input) return;
    onSearch(input);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const detectedPin = await getPinFromCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          
          if (detectedPin && /^\d{6}$/.test(detectedPin)) {
            setQuery(detectedPin);
          } else {
            // If we can't get a PIN, search by coords directly
             onSearch({ lat: position.coords.latitude, lng: position.coords.longitude });
          }
        } catch (error) {
          console.error("Location detection error:", error);
          alert(t.errorLocating);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable location access.";
        }
        alert(errorMessage);
      }
    );
  };

  const handleMapConfirm = (coords: { lat: number; lng: number }) => {
    setIsMapOpen(false);
    onSearch(coords);
  };

  const isProcessing = isLoading || isLocating;

  return (
    <>
      <div className="bg-emerald-50 py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-emerald-900 mb-4">
            {t.heroTitle}
          </h2>
          <p className="text-lg text-emerald-700 mb-8">
            {t.heroSubtitle}
          </p>
          
          <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto flex shadow-md rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <div className="bg-white flex items-center pl-4 text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-grow w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none"
              disabled={isProcessing}
            />

            <div className="bg-white flex items-center pr-2 space-x-1">
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                disabled={isProcessing}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title="Select on Map"
              >
                <MapIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isProcessing}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title={t.detectLocation}
              >
                {isLocating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Locate className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !query.trim()}
              className={`flex items-center justify-center px-6 sm:px-8 py-4 font-bold text-white transition-colors duration-200 min-w-[120px]
                ${isProcessing || !query.trim()
                  ? 'bg-emerald-300 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'}`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">
                    {isLocating ? t.locating : t.analyzing}
                  </span>
                </div>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{t.analyze}</span>
                  <span className="sm:hidden">{t.analyze}</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-3 text-center flex justify-center space-x-6 sm:hidden">
             <button 
               type="button"
               onClick={() => setIsMapOpen(true)}
               disabled={isProcessing}
               className="text-xs text-emerald-600 hover:text-emerald-800 underline decoration-dotted flex items-center"
             >
               <MapIcon className="h-3 w-3 mr-1" />
               Select on Map
             </button>
             <button 
               type="button"
               onClick={handleDetectLocation}
               disabled={isProcessing}
               className="text-xs text-emerald-600 hover:text-emerald-800 underline decoration-dotted flex items-center"
             >
               <Locate className="h-3 w-3 mr-1" />
               {isLocating ? t.detecting : t.detectLocation}
             </button>
          </div>
        </div>
      </div>

      <MapPicker 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onConfirm={handleMapConfirm}
      />
    </>
  );
};

export default SearchInput;