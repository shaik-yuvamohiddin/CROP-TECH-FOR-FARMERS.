import React from 'react';
import { HistoricalCrop, Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Coins } from 'lucide-react';
import { translations } from '../utils/translations';

interface HistoricalChartProps {
  data: HistoricalCrop[];
  language: Language;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, language }) => {
  const t = translations[language];

  // Transform nested data into a flat structure for Recharts
  // Input: [{ crop: 'Wheat', yearly_data: [{year: '2020', price: 2000}, ...] }, ...]
  // Output: [{ year: '2020', Wheat: 2000, Rice: 2500 }, ...]
  
  const transformData = () => {
    if (!data || data.length === 0) return [];
    
    const years = new Set<string>();
    data.forEach(crop => crop.yearly_data.forEach(d => years.add(d.year)));
    
    const sortedYears = Array.from(years).sort();

    return sortedYears.map(year => {
      const dataPoint: any = { year };
      data.forEach(crop => {
        const record = crop.yearly_data.find(d => d.year === year);
        if (record) {
          dataPoint[crop.crop] = record.price;
        }
      });
      return dataPoint;
    });
  };

  const chartData = transformData();
  
  // Vibrant colors for the lines
  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-emerald-100 shadow-xl rounded-xl">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm py-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-600 font-medium">{entry.name}:</span>
              <span className="text-gray-900 font-bold">₹{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-emerald-900/5 overflow-hidden border border-emerald-50 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="text-white h-5 w-5 mr-2" />
          <h3 className="text-lg font-bold text-white">{t.historyTitle}</h3>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-xs text-white font-medium flex items-center backdrop-blur-md">
          <Coins className="h-3 w-3 mr-1" />
          5 Year Comparison
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Comparison of <span className="text-emerald-700 font-bold">Market Price (₹/Quintal)</span> trends over the last 5 years.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {data.map((crop, index) => (
                <Line
                  key={crop.crop}
                  type="monotone"
                  dataKey={crop.crop}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
