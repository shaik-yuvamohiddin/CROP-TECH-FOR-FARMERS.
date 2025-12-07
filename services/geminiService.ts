import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CropData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const locationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    state: { type: Type.STRING },
    district: { type: Type.STRING },
    tehsil: { type: Type.STRING },
    soil_type: { type: Type.STRING },
    ph_range: { type: Type.STRING },
    nitrogen: { type: Type.STRING, description: "Nitrogen content level (Low/Medium/High)" },
    phosphorus: { type: Type.STRING, description: "Phosphorus content level (Low/Medium/High)" },
    potassium: { type: Type.STRING, description: "Potassium content level (Low/Medium/High)" },
    organic_matter: { type: Type.STRING, description: "Organic matter content (Low/Medium/High)" },
    temperature: { type: Type.STRING, description: "Current temperature e.g., '32°C'" },
    weather_condition: { type: Type.STRING, description: "Current weather description e.g., 'Sunny', 'Partly Cloudy'" },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER },
      }
    }
  },
  required: ["state", "district", "soil_type", "ph_range"],
};

const yearlyDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    year: { type: Type.STRING, description: "Year (e.g., '2023')" },
    price: { type: Type.NUMBER, description: "Average market price per quintal in INR (numeric value only)" },
    yield_trend: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
  },
  required: ["year", "price", "yield_trend"],
};

const historicalCropSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    crop: { type: Type.STRING },
    yearly_data: { 
      type: Type.ARRAY, 
      items: yearlyDataSchema,
      description: "Data for the past 5 years (e.g., 2020-2024)"
    },
  },
  required: ["crop", "yearly_data"],
};

const seasonalSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    season: { type: Type.STRING, description: "Name of the season (Kharif, Rabi, Zaid)" },
    crops: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["season", "crops"],
};

const recommendationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    crop: { type: Type.STRING },
    reason: { type: Type.STRING },
    suitability_score: { type: Type.INTEGER, description: "A score from 0 to 100 indicating the suitability match percentage." },
    current_price: { type: Type.NUMBER, description: "Current live market price estimate per quintal" },
    price_trend: { type: Type.STRING, enum: ["Up", "Down", "Stable"], description: "Current market trend" },
  },
  required: ["crop", "reason", "suitability_score", "current_price", "price_trend"],
};

const mainSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pin_code: { type: Type.STRING },
    error: { type: Type.STRING, nullable: true },
    location_info: locationSchema,
    historical_top_crops: {
      type: Type.ARRAY,
      items: historicalCropSchema,
      description: "Top 3-5 historical crops with 5-year revenue data"
    },
    seasonal_calendar: {
      type: Type.ARRAY,
      items: seasonalSchema,
      description: "List of 3 seasonal recommendations: Kharif, Rabi, and Zaid"
    },
    future_recommendations: {
      type: Type.ARRAY,
      items: recommendationSchema,
    },
  },
  required: ["pin_code", "location_info", "historical_top_crops", "seasonal_calendar", "future_recommendations"],
};

const getLanguageName = (langCode: string): string => {
  switch (langCode) {
    case 'hi': return 'Hindi';
    case 'ta': return 'Tamil';
    case 'te': return 'Telugu';
    case 'kn': return 'Kannada';
    case 'ml': return 'Malayalam';
    default: return 'English';
  }
};

// Helper: Uses Google Maps tool to resolve a text query to specific Lat/Lng/PIN
const resolveLocation = async (query: string): Promise<{ lat: number, lng: number, pin: string, address: string } | null> => {
  try {
    const prompt = `
      Find the precise location for "${query}" in India using Google Maps.
      I need the Latitude, Longitude, and the 6-digit PIN code.
      Return the output in this specific string format:
      "LAT: <latitude>, LNG: <longitude>, PIN: <pincode>, ADDR: <full address>"
      Example: LAT: 19.0760, LNG: 72.8777, PIN: 400001, ADDR: Mumbai, Maharashtra
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    
    const latMatch = text.match(/LAT:\s*(-?\d+(\.\d+)?)/);
    const lngMatch = text.match(/LNG:\s*(-?\d+(\.\d+)?)/);
    const pinMatch = text.match(/PIN:\s*(\d{6})/);
    const addrMatch = text.match(/ADDR:\s*(.+)/);

    if (latMatch && lngMatch) {
      return {
        lat: parseFloat(latMatch[1]),
        lng: parseFloat(lngMatch[1]),
        pin: pinMatch ? pinMatch[1] : "000000",
        address: addrMatch ? addrMatch[1].trim() : query
      };
    }
    return null;
  } catch (error) {
    console.error("Location Resolution Error:", error);
    return null;
  }
};

// Helper: Uses Google Search to get LIVE context
const getLiveSearchContext = async (locationQuery: string): Promise<string> => {
  try {
    const prompt = `
      Perform a Google Search to find the CURRENT weather (Temperature in Celsius, Condition) 
      and the LATEST mandi/market prices for major agricultural crops in or near: ${locationQuery}.
      Summarize the key figures (Temp, top crop prices).
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return response.text || "No live data available.";
  } catch (error) {
    console.error("Live Search Error:", error);
    return "Live data unavailable.";
  }
};

export const getCropAnalysis = async (query: string | { lat: number, lng: number }, language: string = 'en'): Promise<CropData> => {
  try {
    const langName = getLanguageName(language);
    
    let analysisContext = "";
    let detectedPin = "";
    let locationForSearch = "";

    if (typeof query === 'object') {
      analysisContext = `Specific Coordinates selected by user on map: Latitude ${query.lat}, Longitude ${query.lng}`;
      locationForSearch = `${query.lat},${query.lng} India`;
    } else if (/^\d{6}$/.test(query)) {
      analysisContext = `PIN code region: ${query}`;
      detectedPin = query;
      locationForSearch = `India PIN Code ${query}`;
    } else {
      const locationData = await resolveLocation(query);
      if (locationData) {
        analysisContext = `Specific Location: ${locationData.address} (Coordinates: ${locationData.lat}, ${locationData.lng}). Associated PIN: ${locationData.pin}`;
        detectedPin = locationData.pin;
        locationForSearch = locationData.address;
      } else {
        analysisContext = `Region named: "${query}"`;
        locationForSearch = query;
      }
    }

    // Step 2: Get Live Data via Search
    const liveData = await getLiveSearchContext(locationForSearch);

    // Step 3: Main JSON Generation
    const prompt = `
      You are an agricultural expert AI for the "CropTech" system. 
      Your task is to analyze the following Indian location:
      ${analysisContext}
      
      LIVE CONTEXT (Use this for Temperature and Current Prices):
      ${liveData}
      
      Determine the following:
      1. Location Details:
         - District, State, Tehsil.
         - Soil type and pH range.
         - ESTIMATED Soil Nutrients (N, P, K) and Organic Matter.
         - **CURRENT Temperature** (from live context or estimate) and Weather Condition.
         - Identify the correct 6-digit PIN CODE.
      2. Historical Agriculture Analysis (Top 3 Crops):
         - For EACH crop, provide a year-by-year estimate for the last 5 years.
         - For each year, provide the Average Market Price per Quintal (INR) and Yield Trend.
      3. Seasonal Crop Calendar (Kharif, Rabi, Zaid).
      4. Future Crop Recommendations (Top 5):
         - Best crops based on soil, climate, and market stability.
         - Suitability score (0-100).
         - **Current Market Price** (per quintal) and **Price Trend** (Up/Down/Stable) based on the live context or recent trends.
      
      DATA REQUIREMENT:
      - If PIN code detected: ${detectedPin}, include it.
      - Ensure 'price' is a NUMBER.

      LANGUAGE REQUIREMENT:
      - Provide the response in ${langName}.
      - JSON KEYS must be English. Values in ${langName}.
      
      CONSTRAINTS:
      - OUTPUT MUST BE DETERMINISTIC.
      - Tone: Farmer-friendly.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0, 
        responseMimeType: "application/json",
        responseSchema: mainSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as CropData;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getPinFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const prompt = `
      Identify the 6-digit Indian PIN code (Postal Code) for the location at Latitude: ${lat}, Longitude: ${lng}.
      Return ONLY the 6-digit PIN code as a string.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        },
      },
    });

    const text = response.text || "";
    const match = text.match(/\b\d{6}\b/);
    return match ? match[0] : null;
  } catch (error) {
    console.error("Gemini Geo-lookup Error:", error);
    return null;
  }
};