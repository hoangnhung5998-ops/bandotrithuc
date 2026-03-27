import React, { useState, useEffect } from 'react';
import { MapPin, Info, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Heritage } from '../../core/types';

export const InteractiveMap = () => {
  const [locations, setLocations] = useState<Heritage[]>([]);
  const [selected, setSelected] = useState<Heritage | null>(null);

  useEffect(() => {
    dataProvider.getInteractiveMapData().then(setLocations);
  }, []);

  return (
    <div className="relative h-[calc(100vh-12rem)] bg-slate-200 rounded-3xl overflow-hidden shadow-inner border-4 border-white">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1920/1080?blur=5')] bg-cover bg-center opacity-40"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-10">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="border border-slate-400"></div>
        ))}
      </div>

      {/* Map Markers */}
      {locations.map((loc) => (
        <motion.button
          key={loc.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          onClick={() => setSelected(loc)}
          className="absolute z-10 p-2 bg-white rounded-full shadow-lg text-emerald-600 hover:text-white hover:bg-emerald-500 transition-all border-2 border-emerald-100"
          style={{
            left: `${(loc.coordinates.lng - 102) * 15}%`, // Simple mock projection
            top: `${(24 - loc.coordinates.lat) * 10}%`
          }}
        >
          <MapPin size={24} />
        </motion.button>
      ))}

      {/* Info Panel */}
      {selected && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-6 right-6 w-80 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 z-20"
        >
          <button 
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
          <img 
            src={selected.imageUrl || undefined} 
            alt={selected.name} 
            className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <h3 className="text-xl font-bold text-slate-800 mb-1">{selected.name}</h3>
          <p className="text-sm text-emerald-600 font-medium mb-3 flex items-center gap-1">
            <MapPin size={14} /> {selected.location}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {selected.description}
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
              <Navigation size={16} /> Bắt đầu đi
            </button>
            <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
              <Info size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-20">
        <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col gap-1">
          <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-xl">+</button>
          <div className="h-px bg-slate-100 mx-2"></div>
          <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-xl">-</button>
        </div>
      </div>

      <div className="absolute top-6 left-6 z-20">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/40 flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-slate-700">Bản đồ di sản 4.0</span>
        </div>
      </div>
    </div>
  );
};
