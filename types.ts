export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';

export interface LocationInfo {
  state: string;
  district: string;
  tehsil: string;
  soil_type: string;
  ph_range: string;
  nitrogen?: string;
  phosphorus?: string;
  potassium?: string;
  organic_matter?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  temperature?: string; // e.g. "32°C"
  weather_condition?: string; // e.g. "Sunny"
}

export interface YearlyData {
  year: string;
  price: number; // Numeric price per quintal for charting
  yield_trend: "High" | "Medium" | "Low";
}

export interface HistoricalCrop {
  crop: string;
  yearly_data: YearlyData[]; // Array of past 5 years data
}

export interface FutureRecommendation {
  crop: string;
  reason: string;
  suitability_score: number;
  current_price?: number; // Estimated current market price
  price_trend?: "Up" | "Down" | "Stable";
}

export interface SeasonalRecommendation {
  season: string;
  crops: string[];
}

export interface CropData {
  pin_code: string;
  error?: string;
  location_info: LocationInfo;
  historical_top_crops: HistoricalCrop[];
  seasonal_calendar: SeasonalRecommendation[];
  future_recommendations: FutureRecommendation[];
}