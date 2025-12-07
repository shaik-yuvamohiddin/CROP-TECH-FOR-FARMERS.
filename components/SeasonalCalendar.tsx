import React from 'react';
import { SeasonalRecommendation, Language } from '../types';
import { Calendar, Sun, CloudRain, Snowflake } from 'lucide-react';
import { translations } from '../utils/translations';

interface SeasonalCalendarProps {
  data: SeasonalRecommendation[];
  language: Language;
}

const SeasonalCalendar: React.FC<SeasonalCalendarProps> = ({ data, language }) => {
  const t = translations[language];

  const getSeasonIcon = (seasonName: string) => {
    const lower = seasonName.toLowerCase();
    if (lower.includes('kharif')) return <CloudRain className="h-5 w-5 text-blue-500" />;
    if (lower.includes('rabi')) return <Snowflake className="h-5 w-5 text-cyan-500" />;
    return <Sun className="h-5 w-5 text-orange-500" />; // Zaid
  };

  const getSeasonLabel = (seasonName: string) => {
    const lower = seasonName.toLowerCase();
    if (lower.includes('kharif')) return t.kharif;
    if (lower.includes('rabi')) return t.rabi;
    if (lower.includes('zaid')) return t.zaid;
    return seasonName;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="bg-teal-700 px-6 py-4 flex items-center">
        <Calendar className="text-white h-5 w-5 mr-2" />
        <h3 className="text-lg font-bold text-white">{t.seasonalTitle}</h3>
      </div>
      <div className="p-6">
        <div className="space-y-5">
          {data.map((season, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-center sm:w-1/3 mb-2 sm:mb-0">
                <div className="bg-gray-100 p-2 rounded-full mr-3">
                  {getSeasonIcon(season.season)}
                </div>
                <span className="font-bold text-gray-800 text-sm sm:text-base">
                  {getSeasonLabel(season.season)}
                </span>
              </div>
              <div className="sm:w-2/3">
                <div className="flex flex-wrap gap-2">
                  {season.crops.map((crop, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalCalendar;