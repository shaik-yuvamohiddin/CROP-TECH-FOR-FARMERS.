import React from 'react';
import { FutureRecommendation, Language } from '../types';
import { Sprout, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { translations } from '../utils/translations';

interface RecommendationsListProps {
  recommendations: FutureRecommendation[];
  language: Language;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations, language }) => {
  const t = translations[language];
  
  const getTrendIcon = (trend?: string) => {
    switch(trend) {
      case 'Up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch(trend) {
      case 'Up': return 'bg-green-50 border-green-100 text-green-700';
      case 'Down': return 'bg-red-50 border-red-100 text-red-700';
      default: return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 px-1">
        <div className="bg-emerald-100 p-2 rounded-lg">
           <Sprout className="h-6 w-6 text-emerald-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{t.futureTitle}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => {
          // Generate a dynamic placeholder image URL based on the crop name
          const imageUrl = `https://loremflickr.com/320/240/agriculture,${rec.crop.split(' ')[0]}?random=${index}`;

          return (
            <div 
              key={index} 
              className="group bg-white rounded-2xl shadow-lg shadow-emerald-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-emerald-50 flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-40 bg-gray-200 overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={rec.crop} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://loremflickr.com/320/240/agriculture,field'; // Fallback
                  }}
                />
                <div className="absolute top-0 right-0 m-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-sm flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-emerald-500 text-emerald-500" />
                  {rec.suitability_score}% {t.match}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h4 className="text-xl font-bold text-white shadow-sm">{rec.crop}</h4>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {rec.reason}
                  </p>

                  {/* Live Market Pulse */}
                  {(rec.current_price) && (
                    <div className={`mb-4 rounded-lg p-2.5 border flex items-center justify-between ${getTrendColor(rec.price_trend)}`}>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold opacity-70 tracking-wide">{t.livePrice}</span>
                         <span className="font-bold text-sm">₹{rec.current_price}/{t.perQuintal}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                         <span className="text-xs font-medium">{t.trend}</span>
                         {getTrendIcon(rec.price_trend)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Suitability */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      rec.suitability_score > 80 ? 'bg-emerald-500' : 
                      rec.suitability_score > 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${rec.suitability_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsList;