import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Heritage } from '../core/types';
import { 
  MapPin, 
  ExternalLink, 
  HardDrive, 
  Youtube, 
  Info,
  Navigation
} from 'lucide-react';

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HeritageMapProps {
  heritages: Heritage[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (heritage: Heritage) => void;
}

const RecenterMap = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const HeritageMap: React.FC<HeritageMapProps> = ({ 
  heritages, 
  center = [21.8234, 105.2134] as [number, number], // Default to Tuyên Quang
  zoom = 9 
}) => {
  return (
    <div className="w-full h-full rounded-[32px] overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap center={center} zoom={zoom} />

        {heritages.map((heritage) => (
          heritage.coordinates && (
            <Marker 
              key={heritage.id} 
              position={[heritage.coordinates.lat, heritage.coordinates.lng] as [number, number]}
            >
              <Popup className="heritage-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="h-24 rounded-lg overflow-hidden mb-3">
                    <img 
                      src={heritage.imageUrl || 'https://picsum.photos/seed/heritage/400/300'} 
                      alt={heritage.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm mb-1">{heritage.name}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold mb-2 flex items-center gap-1">
                    <MapPin size={10} /> {heritage.location}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {heritage.description}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {heritage.youtubeUrl && (
                      <a 
                        href={heritage.youtubeUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="Xem video"
                      >
                        <Youtube size={14} />
                      </a>
                    )}
                    {heritage.driveUrl && (
                      <a 
                        href={heritage.driveUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Tài liệu Drive"
                      >
                        <HardDrive size={14} />
                      </a>
                    )}
                    {heritage.webUrl && (
                      <a 
                        href={heritage.webUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="Trang web chi tiết"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button 
                      className="ml-auto p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Navigation size={12} /> Chỉ đường
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Map Legend/Controls Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl max-w-[200px]">
        <h4 className="text-xs font-black text-slate-800 mb-2 flex items-center gap-2">
          <Info size={14} className="text-emerald-500" /> Chú giải bản đồ
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>Di sản thiên nhiên</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Di tích lịch sử</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Di sản văn hóa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
