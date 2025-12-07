import React, { useEffect, useRef, useState } from 'react';
import { X, Check, MapPin } from 'lucide-react';

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ isOpen, onClose, onConfirm }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Leaflet map instance
  const markerRef = useRef<any>(null); // Leaflet marker instance
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return;

    // Default to Center of India if no geolocation, or try to get current location first
    const defaultLat = 20.5937;
    const defaultLng = 78.9629;
    
    // Access L from global window object
    const L = (window as any).L;
    if (!L) {
      console.error("Leaflet not loaded");
      return;
    }

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle clicks
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
    });

    // Try to get user location to center map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);
        // Don't auto-select, let user click
      });
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Fix map sizing issues when modal opens
  useEffect(() => {
    if (isOpen && mapInstanceRef.current) {
       setTimeout(() => {
         mapInstanceRef.current.invalidateSize();
       }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-emerald-700 text-white p-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <h3 className="font-bold text-lg">Select Location</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-600 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-grow relative bg-gray-100">
           <div id="map" ref={mapRef} className="w-full h-full z-0" />
           
           {!selectedCoords && (
             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-emerald-800 z-[400] pointer-events-none">
               Tap anywhere on the map to select
             </div>
           )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedCoords 
              ? `Selected: ${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`
              : "No location selected"}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedCoords && onConfirm(selectedCoords)}
              disabled={!selectedCoords}
              className={`px-6 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors
                ${selectedCoords 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Check className="h-4 w-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;