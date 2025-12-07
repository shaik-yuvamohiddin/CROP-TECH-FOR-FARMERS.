import React from 'react';
import { LocationInfo, Language } from '../types';
import { Map, Droplets, FlaskConical, MapPin, ExternalLink, Leaf, Navigation, Thermometer, CloudSun } from 'lucide-react';
import { translations } from '../utils/translations';

interface LocationCardProps {
  info: LocationInfo;
  language: Language;
}

const LocationCard: React.FC<LocationCardProps> = ({ info, language }) => {
  const t = translations[language];

  const openMap = () => {
    if (info.coordinates) {
      const url = `https://www.google.com/maps/@${info.coordinates.lat},${info.coordinates.lng},15z/data=!3m1!1e3`;
      window.open(url, '_blank');
    } else {
      const query = `${info.tehsil}, ${info.district}, ${info.state}, India`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-900/5 overflow-hidden border border-emerald-50 hover:shadow-xl transition-all duration-300 h-full">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center text-white">
          <Navigation className="h-5 w-5 mr-3" />
          <h3 className="text-lg font-bold tracking-wide">{t.regionDetails}</h3>
        </div>
        <button 
          onClick={openMap}
          className="group relative bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center transition-all backdrop-blur-sm text-xs font-medium"
        >
          <span className="hidden sm:inline mr-2">{t.viewSatellite}</span>
          <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Geographic Details - Modern Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t.state}</p>
            <p className="text-base font-bold text-gray-800 truncate" title={info.state}>{info.state || "-"}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t.district}</p>
            <p className="text-base font-bold text-gray-800 truncate" title={info.district}>{info.district || "-"}</p>
          </div>
          <div className="col-span-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{t.tehsil}</p>
            <div className="flex items-center text-emerald-900">
              <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
              <p className="text-base font-bold truncate">{info.tehsil || "General Region"}</p>
            </div>
          </div>
        </div>

        {/* Weather Section */}
        {(info.temperature || info.weather_condition) && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-2 -mr-2 text-blue-100 opacity-50">
               <CloudSun className="h-24 w-24" />
             </div>
             <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 relative z-10">{t.weather}</h4>
             <div className="flex items-end space-x-2 relative z-10">
                {info.temperature && (
                  <div className="text-3xl font-bold text-gray-800 flex items-start">
                    {info.temperature}
                    <Thermometer className="h-5 w-5 text-red-400 ml-1 mt-1" />
                  </div>
                )}
                {info.weather_condition && (
                  <div className="text-sm font-medium text-gray-600 pb-1.5 px-2 bg-white/60 rounded-lg">
                    {info.weather_condition}
                  </div>
                )}
             </div>
          </div>
        )}
        
        {/* Soil Health Section - Clean Look */}
        <div>
           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.soilType} & {t.phRange}</h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center p-3 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                <div className="bg-amber-100 p-2 rounded-lg mr-3 shadow-sm">
                  <Droplets className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-semibold mb-0.5">{t.soilType}</p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{info.soil_type}</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="bg-blue-100 p-2 rounded-lg mr-3 shadow-sm">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-0.5">{t.phRange}</p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{info.ph_range}</p>
                </div>
              </div>
           </div>
        </div>

        {/* Nutrients - Visual Badges */}
        {(info.nitrogen || info.organic_matter) && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.nutrients}</h4>
            <div className="grid grid-cols-4 gap-2">
               {[
                 { label: 'N', val: info.nitrogen, color: 'emerald' },
                 { label: 'P', val: info.phosphorus, color: 'teal' },
                 { label: 'K', val: info.potassium, color: 'cyan' },
               ].map((n, i) => (
                 <div key={i} className={`text-center p-2 rounded-lg bg-${n.color}-50 border border-${n.color}-100`}>
                   <div className={`text-[10px] font-bold text-${n.color}-600 mb-1`}>{n.label}</div>
                   <div className="text-xs font-bold text-gray-800">{n.val?.substring(0, 1) || "-"}</div>
                 </div>
               ))}
               
               <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 border border-green-100">
                 <Leaf className="h-3 w-3 text-green-600 mb-1" />
                 <div className="text-[10px] font-bold text-gray-800 truncate w-full text-center" title={info.organic_matter}>{info.organic_matter === 'Medium' ? 'Med' : info.organic_matter || '-'}</div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCard;