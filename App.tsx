import React, { useState } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import LocationCard from './components/LocationCard';
import HistoricalChart from './components/HistoricalChart';
import RecommendationsList from './components/RecommendationsList';
import SeasonalCalendar from './components/SeasonalCalendar';
import ErrorDisplay from './components/ErrorDisplay';
import { getCropAnalysis } from './services/geminiService';
import { CropData, Language } from './types';
import { translations } from './utils/translations';

function App() {
  const [data, setData] = useState<CropData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  // If we change language, we should probably clear the current data 
  // or re-fetch if we wanted to be fancy, but clearing is safer to avoid language mismatch
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (data) {
       // Optional: Re-fetch data in new language if we already have a PIN
       handleSearch(data.pin_code, lang);
    }
  };

  const handleSearch = async (query: string | { lat: number, lng: number }, langOverride?: Language) => {
    const activeLang = langOverride || language;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await getCropAnalysis(query, activeLang);
      
      // Check if the AI returned an error within the JSON structure
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the analysis service. Please check your internet connection or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header language={language} setLanguage={handleLanguageChange} />
      
      <main className="flex-grow">
        <SearchInput onSearch={handleSearch} isLoading={loading} language={language} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && <ErrorDisplay message={error} language={language} />}

          {data && !error && (
            <div className="animate-fade-in-up space-y-6">
              
              {/* Top Row: Location & History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <LocationCard info={data.location_info} language={language} />
                </div>
                <div className="lg:col-span-2">
                  <HistoricalChart data={data.historical_top_crops} language={language} />
                </div>
              </div>

              {/* Middle Row: Seasonal Calendar */}
              <div>
                <SeasonalCalendar data={data.seasonal_calendar} language={language} />
              </div>

              {/* Bottom Row: Recommendations */}
              <div>
                <RecommendationsList recommendations={data.future_recommendations} language={language} />
              </div>
              
              <div className="text-center pt-8 pb-4">
                 <p className="text-xs text-gray-400">
                   {t.disclaimer}
                 </p>
              </div>
            </div>
          )}
          
          {!data && !loading && !error && (
            <div className="text-center py-12 opacity-50">
              <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🌾</span>
              </div>
              <h3 className="text-lg font-medium text-gray-500">{t.readyTitle}</h3>
              <p className="text-gray-400">{t.readySubtitle}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;