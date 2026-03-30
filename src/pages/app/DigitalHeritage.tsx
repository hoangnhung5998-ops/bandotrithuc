import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Scroll, 
  Music, 
  Scissors, 
  Theater,
  History,
  ArrowRight,
  Map as MapIcon,
  Grid,
  Users,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeritageMap } from '../../components/HeritageMap';
import { dataProvider } from '../../core/provider';
import { Heritage, Topic, HistoricalFigure } from '../../core/types';
import { getGoogleDriveDirectLink, ensureProtocol, getYoutubeEmbedLink } from '../../core/utils';
import { HardDrive } from 'lucide-react';
import { ExpandableText } from '../../components/ExpandableText';

export const DigitalHeritage = () => {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heritageData, figureData, currentUser] = await Promise.all([
          dataProvider.getList<Heritage>('heritages'),
          dataProvider.getList<HistoricalFigure>('historicalFigures'),
          dataProvider.getCurrentUser()
        ]);
        console.log('Fetched heritages:', heritageData);
        console.log('Fetched figures:', figureData);
        setHeritages(heritageData || []);
        setFigures(figureData || []);
        setUserRole(currentUser?.role || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setHeritages([]);
        setFigures([]);
      }
    };
    fetchData();
  }, []);

  const topics = [
    { 
      id: 'natural', 
      title: 'Thiên nhiên', 
      icon: Leaf, 
      color: 'text-emerald-500', 
      bgColor: 'bg-emerald-50',
      description: 'Khám phá rừng núi, sông suối và hệ sinh thái đặc trưng' 
    },
    { 
      id: 'historical', 
      title: 'Lịch sử', 
      icon: Scroll, 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-50',
      description: 'Tìm hiểu quá khứ hào hùng, các di tích lịch sử và con người vùng đất' 
    },
    { 
      id: 'cultural', 
      title: 'Văn hóa', 
      icon: Theater, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50',
      description: 'Trải nghiệm lễ hội, phong tục tập quán và nền văn hóa đa dạng' 
    },
    { 
      id: 'figures', 
      title: 'Nhân vật', 
      icon: Users, 
      color: 'text-indigo-500', 
      bgColor: 'bg-indigo-50',
      description: 'Tìm hiểu về các anh hùng, danh nhân và những người con ưu tú' 
    },
    { 
      id: 'arts', 
      title: 'Nghệ thuật', 
      icon: Music, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-50',
      description: 'Khám phá âm nhạc truyền thống, dân ca và các nghề thủ công địa phương' 
    },
  ];

  const filteredHeritages = selectedType 
    ? heritages.filter(h => {
        const type = String(h.type).trim().toLowerCase();
        const selected = String(selectedType).trim().toLowerCase();
        if (selected === 'arts') return type === 'music' || type === 'craft';
        return type === selected;
      })
    : heritages;

  const filteredFigures = selectedType === 'figures' ? figures : [];
  const isShowingFigures = selectedType === 'figures';

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 relative">
        {(userRole === 'teacher' || userRole === 'admin') && (
          <div className="absolute top-0 right-0">
            <button 
              onClick={() => navigate('/admin/heritage')}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
            >
              Quản lý Di sản
            </button>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-100">
          <History size={14} /> Không gian số
        </div>
        <h2 className="text-4xl font-black text-slate-800">Di sản số</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Nơi công nghệ hiện đại kết nối chúng ta với những giá trị truyền thống, lịch sử hào hùng của dân tộc.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={() => setSelectedType(selectedType === topic.id ? null : topic.id)}
            className={`p-8 rounded-[40px] shadow-sm border flex flex-col items-center text-center space-y-6 group cursor-pointer transition-all ${
              selectedType === topic.id 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-200' 
                : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-emerald-100/50'
            }`}
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              selectedType === topic.id ? 'bg-white/20 text-white' : `${topic.bgColor} ${topic.color}`
            }`}>
              <topic.icon size={40} />
            </div>
            <div className="space-y-3">
              <h3 className={`text-xl font-black ${selectedType === topic.id ? 'text-white' : 'text-emerald-600'}`}>
                {topic.title}
              </h3>
              <p className={`text-sm font-medium leading-relaxed ${selectedType === topic.id ? 'text-emerald-50' : 'text-slate-500'}`}>
                {topic.description}
              </p>
            </div>
            <div className={`pt-2 transition-opacity ${selectedType === topic.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                selectedType === topic.id ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white shadow-emerald-200'
              }`}>
                <ArrowRight size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filtered Heritages List */}
      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">
                Danh sách di sản: <span className="text-emerald-600">{topics.find(t => t.id === selectedType)?.title}</span>
              </h3>
              <button 
                onClick={() => setSelectedType(null)}
                className="text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors"
              >
                Xem tất cả di sản
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isShowingFigures ? (
                filteredFigures.map((figure) => (
                  <motion.div
                    key={figure.id}
                    layout
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <img 
                        src={getGoogleDriveDirectLink(figure.avatar)} 
                        alt={figure.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-800">
                          {figure.period}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="space-y-1 min-h-[4.5rem]">
                        <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {figure.name}
                        </h4>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider line-clamp-1">{figure.title}</p>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <ExpandableText text={figure.description} />
                      </div>
                      <div className="pt-4 mt-auto border-t border-slate-50">
                        <div className="flex flex-wrap gap-2">
                          {figure.achievements?.slice(0, 3).map((achievement, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                filteredHeritages.map((heritage) => (
                  <motion.div
                    key={heritage.id}
                    layout
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <img 
                        src={getGoogleDriveDirectLink(heritage.imageUrl)} 
                        alt={heritage.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-800">
                          {heritage.location}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <h4 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {heritage.name}
                      </h4>
                      <div className="flex-1 overflow-hidden">
                        <ExpandableText text={heritage.description} />
                      </div>
                      <div className="flex gap-3 pt-4 mt-auto border-t border-slate-50">
                        {heritage.webUrl && (
                          <a 
                            href={ensureProtocol(heritage.webUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black hover:bg-emerald-500 hover:text-white transition-all text-center"
                          >
                            Chi tiết
                          </a>
                        )}
                        {heritage.youtubeUrl && (
                          <button 
                            onClick={() => setActiveVideo(getYoutubeEmbedLink(ensureProtocol(heritage.youtubeUrl)))}
                            className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-500 hover:text-white transition-all text-center"
                          >
                            Video
                          </button>
                        )}
                        {heritage.driveUrl && (
                          <a 
                            href={ensureProtocol(heritage.driveUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-3 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-500 hover:text-white transition-all text-center flex items-center justify-center gap-2"
                          >
                            <HardDrive size={14} /> Drive
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {((!isShowingFigures && filteredHeritages.length === 0) || (isShowingFigures && filteredFigures.length === 0)) && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-lg">Chưa có dữ liệu nào trong mục này.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Section */}
      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-black">Khám phá bản đồ di sản tương tác</h3>
            <p className="text-slate-400 text-lg">
              Sử dụng bản đồ số để tìm hiểu vị trí và thông tin chi tiết về các di tích lịch sử, danh lam thắng cảnh.
            </p>
            <button 
              onClick={() => setShowMap(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/20"
            >
              Bắt đầu khám phá <ArrowRight size={20} />
            </button>
          </div>
          <div className="relative">
            <div className="aspect-video bg-slate-800 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <img 
                src="https://lh3.googleusercontent.com/u/0/d/1PT3tMHqhF0eksKO3zdZmyiROLKW2lQki" 
                alt="Interactive Map Preview" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <MapIcon size={32} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Fullscreen Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <MapIcon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white">Bản đồ di sản tương tác</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Digital Heritage</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMap(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 relative">
              <HeritageMap heritages={heritages} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
              <iframe 
                src={activeVideo} 
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
