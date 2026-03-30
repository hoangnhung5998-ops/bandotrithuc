import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  Image as ImageIcon, 
  Filter,
  X,
  Globe,
  Camera,
  Youtube,
  ExternalLink,
  HardDrive,
  Users,
  History,
  Award,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { dataProvider } from '../../core/provider';
import { Heritage, HistoricalFigure } from '../../core/types';
import { getGoogleDriveDirectLink, ensureProtocol, getYoutubeEmbedLink } from '../../core/utils';

export const HeritageManagement = ({ initialTab = 'heritages' }: { initialTab?: 'heritages' | 'figures' }) => {
  const [activeTab, setActiveTab] = useState<'heritages' | 'figures'>(initialTab);
  const [heritages, setHeritages] = useState<Heritage[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<Heritage | HistoricalFigure | null>(null);
  
  // Local state for coordinate strings to allow typing dots/commas
  const [latStr, setLatStr] = useState('21.8234');
  const [lngStr, setLngStr] = useState('105.2134');
  
  const [heritageFormData, setHeritageFormData] = useState({
    name: '',
    location: '',
    description: '',
    type: 'cultural',
    imageUrl: '',
    coordinates: { lat: 21.8234, lng: 105.2134 },
    youtubeUrl: '',
    driveUrl: '',
    webUrl: ''
  });

  const [figureFormData, setFigureFormData] = useState({
    name: '',
    title: '',
    description: '',
    period: '',
    avatar: '',
    achievements: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heritageData, figureData] = await Promise.all([
        dataProvider.getList<Heritage>('heritages'),
        dataProvider.getList<HistoricalFigure>('historicalFigures')
      ]);
      setHeritages(heritageData);
      setFigures(figureData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu.');
    }
  };

  const handleOpenModal = (item?: Heritage | HistoricalFigure) => {
    if (item) {
      setEditingItem(item);
      if ('location' in item) {
        setActiveTab('heritages');
        const lat = item.coordinates?.lat ?? 21.8234;
        const lng = item.coordinates?.lng ?? 105.2134;
        setLatStr(String(lat));
        setLngStr(String(lng));
        setHeritageFormData({
          name: item.name,
          location: item.location,
          description: item.description,
          type: item.type,
          imageUrl: item.imageUrl || '',
          coordinates: { lat, lng },
          youtubeUrl: item.youtubeUrl || '',
          driveUrl: item.driveUrl || '',
          webUrl: item.webUrl || ''
        });
      } else {
        setActiveTab('figures');
        setFigureFormData({
          name: item.name,
          title: item.title,
          description: item.description,
          period: item.period,
          avatar: item.avatar || '',
          achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : String(item.achievements || '')
        });
      }
    } else {
      setEditingItem(null);
      if (activeTab === 'heritages') {
        setLatStr('21.8234');
        setLngStr('105.2134');
        setHeritageFormData({
          name: '',
          location: '',
          description: '',
          type: 'cultural',
          imageUrl: '',
          coordinates: { lat: 21.8234, lng: 105.2134 },
          youtubeUrl: '',
          driveUrl: '',
          webUrl: ''
        });
      } else {
        setFigureFormData({
          name: '',
          title: '',
          description: '',
          period: '',
          avatar: '',
          achievements: ''
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (activeTab === 'heritages') {
        const lat = parseFloat(latStr.replace(',', '.')) || 0;
        const lng = parseFloat(lngStr.replace(',', '.')) || 0;

        const processedFormData = {
          ...heritageFormData,
          coordinates: { lat, lng },
          imageUrl: getGoogleDriveDirectLink(ensureProtocol(heritageFormData.imageUrl)),
          youtubeUrl: getYoutubeEmbedLink(ensureProtocol(heritageFormData.youtubeUrl)),
          driveUrl: ensureProtocol(heritageFormData.driveUrl),
          webUrl: ensureProtocol(heritageFormData.webUrl)
        };

        if (editingItem && 'location' in editingItem) {
          const updated = await dataProvider.update<Heritage>('heritages', editingItem.id, processedFormData);
          toast.success('Cập nhật di sản thành công!');
          setHeritages(prev => prev.map(h => h.id === editingItem.id ? { ...updated, id: editingItem.id } : h));
        } else {
          const created = await dataProvider.create<Heritage>('heritages', processedFormData);
          toast.success('Thêm di sản mới thành công!');
          setHeritages(prev => [...prev, created]);
        }
      } else {
        const processedFormData = {
          ...figureFormData,
          avatar: getGoogleDriveDirectLink(ensureProtocol(figureFormData.avatar)),
          achievements: figureFormData.achievements.split('\n').filter(a => a.trim() !== '')
        };

        if (editingItem && !('location' in editingItem)) {
          const updated = await dataProvider.update<HistoricalFigure>('historicalFigures', editingItem.id, processedFormData);
          toast.success('Cập nhật nhân vật thành công!');
          setFigures(prev => prev.map(f => f.id === editingItem.id ? { ...updated, id: editingItem.id } : f));
        } else {
          const created = await dataProvider.create<HistoricalFigure>('historicalFigures', processedFormData);
          toast.success('Thêm nhân vật mới thành công!');
          setFigures(prev => [...prev, created]);
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      toast.error('Không thể lưu thay đổi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'heritages' | 'figures') => {
    const confirmMsg = type === 'heritages' ? 'Bạn có chắc chắn muốn xóa di sản này?' : 'Bạn có chắc chắn muốn xóa nhân vật này?';
    if (window.confirm(confirmMsg)) {
      try {
        await dataProvider.delete(type === 'heritages' ? 'heritages' : 'historicalFigures', id);
        toast.success('Đã xóa thành công!');
        fetchData();
      } catch (error) {
        toast.error('Lỗi khi xóa.');
      }
    }
  };

  const filteredHeritages = heritages.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                         h.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || h.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredFigures = figures.filter(f => {
    return f.name.toLowerCase().includes(search.toLowerCase()) || 
           f.title.toLowerCase().includes(search.toLowerCase()) ||
           f.period.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Di sản số</h2>
          <p className="text-slate-500 text-sm">Quản lý các địa danh di sản và nhân vật lịch sử</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus size={20} /> {activeTab === 'heritages' ? 'Thêm di sản mới' : 'Thêm nhân vật mới'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('heritages')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'heritages' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MapPin size={18} /> Địa danh di sản
        </button>
        <button 
          onClick={() => setActiveTab('figures')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'figures' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={18} /> Nhân vật lịch sử
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'heritages' ? "Tìm kiếm theo tên hoặc địa phương..." : "Tìm kiếm theo tên, danh hiệu, thời kỳ..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        {activeTab === 'heritages' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-48 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả loại di sản</option>
              <option value="cultural">Di sản văn hóa</option>
              <option value="natural">Di sản thiên nhiên</option>
              <option value="historical">Di tích lịch sử</option>
              <option value="music">Di sản âm nhạc</option>
              <option value="craft">Nghề thủ công</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'heritages' ? (
        /* Heritages Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredHeritages.map((heritage) => (
            <motion.div 
              key={heritage.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="relative h-48">
                <img src={getGoogleDriveDirectLink(heritage.imageUrl) || 'https://picsum.photos/seed/heritage/400/300'} alt={heritage.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleOpenModal(heritage)} className="p-2 bg-white/90 backdrop-blur-sm text-blue-500 rounded-lg shadow-sm hover:bg-white transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(heritage.id, 'heritages')} className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-white transition-colors"><Trash2 size={16} /></button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    heritage.type === 'cultural' ? 'bg-blue-500 text-white' : 
                    heritage.type === 'natural' ? 'bg-emerald-500 text-white' : 
                    heritage.type === 'historical' ? 'bg-amber-500 text-white' :
                    heritage.type === 'music' ? 'bg-purple-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {heritage.type === 'cultural' ? 'Văn hóa' : 
                     heritage.type === 'natural' ? 'Thiên nhiên' : 
                     heritage.type === 'historical' ? 'Lịch sử' :
                     heritage.type === 'music' ? 'Âm nhạc' : 'Thủ công'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{heritage.name}</h3>
                <p className="text-xs text-emerald-600 font-medium mb-3 flex items-center gap-1">
                  <MapPin size={12} /> {heritage.location}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{heritage.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    {heritage.youtubeUrl && <a href={ensureProtocol(heritage.youtubeUrl)} target="_blank" rel="noreferrer" className="text-red-500 hover:scale-110 transition-transform"><Youtube size={16} /></a>}
                    {heritage.driveUrl && <a href={ensureProtocol(heritage.driveUrl)} target="_blank" rel="noreferrer" className="text-blue-500 hover:scale-110 transition-transform"><HardDrive size={16} /></a>}
                    {heritage.webUrl && <a href={ensureProtocol(heritage.webUrl)} target="_blank" rel="noreferrer" className="text-emerald-500 hover:scale-110 transition-transform"><ExternalLink size={16} /></a>}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Globe size={12} /> {heritage.coordinates?.lat?.toFixed(2) || '0'}, {heritage.coordinates?.lng?.toFixed(2) || '0'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Figures Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFigures.map((figure) => (
            <motion.div 
              key={figure.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="relative h-48">
                <img src={getGoogleDriveDirectLink(figure.avatar) || 'https://picsum.photos/seed/figure/400/300'} alt={figure.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleOpenModal(figure)} className="p-2 bg-white/90 backdrop-blur-sm text-blue-500 rounded-lg shadow-sm hover:bg-white transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(figure.id, 'figures')} className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-white transition-colors"><Trash2 size={16} /></button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm bg-indigo-500 text-white">
                    {figure.period}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{figure.name}</h3>
                <p className="text-xs text-indigo-600 font-medium mb-3 flex items-center gap-1">
                  <History size={12} /> {figure.title}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{figure.description}</p>
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-500" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {Array.isArray(figure.achievements) ? figure.achievements.length : 0} thành tựu tiêu biểu
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <Sparkles size={12} /> AI: Thân thiện, truyền cảm hứng
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingItem ? (activeTab === 'heritages' ? 'Cập nhật di sản' : 'Cập nhật nhân vật') : (activeTab === 'heritages' ? 'Thêm di sản mới' : 'Thêm nhân vật mới')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {activeTab === 'heritages' ? (
                  /* Heritage Form */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tên di sản</label>
                        <input type="text" required value={heritageFormData.name} onChange={(e) => setHeritageFormData({ ...heritageFormData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tỉnh / Thành phố</label>
                        <input type="text" required value={heritageFormData.location} onChange={(e) => setHeritageFormData({ ...heritageFormData, location: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Mô tả di sản</label>
                      <textarea required value={heritageFormData.description} onChange={(e) => setHeritageFormData({ ...heritageFormData, description: e.target.value })} className="w-full h-24 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Loại di sản</label>
                        <select value={heritageFormData.type} onChange={(e) => setHeritageFormData({ ...heritageFormData, type: e.target.value as any })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                          <option value="cultural">Di sản văn hóa</option>
                          <option value="natural">Di sản thiên nhiên</option>
                          <option value="historical">Di tích lịch sử</option>
                          <option value="music">Di sản âm nhạc</option>
                          <option value="craft">Nghề thủ công</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Link ảnh minh họa</label>
                        <input type="text" value={heritageFormData.imageUrl} onChange={(e) => setHeritageFormData({ ...heritageFormData, imageUrl: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Vĩ độ (Latitude)</label>
                        <input type="text" required value={latStr} onChange={(e) => setLatStr(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="21.8234" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Kinh độ (Longitude)</label>
                        <input type="text" required value={lngStr} onChange={(e) => setLngStr(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="105.2134" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Link YouTube</label>
                        <input type="text" value={heritageFormData.youtubeUrl} onChange={(e) => setHeritageFormData({ ...heritageFormData, youtubeUrl: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://youtube.com/..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Link Google Drive</label>
                        <input type="text" value={heritageFormData.driveUrl} onChange={(e) => setHeritageFormData({ ...heritageFormData, driveUrl: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://drive.google.com/..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Link Website</label>
                      <input type="text" value={heritageFormData.webUrl} onChange={(e) => setHeritageFormData({ ...heritageFormData, webUrl: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://..." />
                    </div>
                  </>
                ) : (
                  /* Figure Form */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Họ và tên</label>
                        <input type="text" required value={figureFormData.name} onChange={(e) => setFigureFormData({ ...figureFormData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Danh hiệu / Chức vụ</label>
                        <input type="text" required value={figureFormData.title} onChange={(e) => setFigureFormData({ ...figureFormData, title: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Thời kỳ lịch sử</label>
                        <input type="text" required value={figureFormData.period} onChange={(e) => setFigureFormData({ ...figureFormData, period: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="Ví dụ: Thế kỷ XV, Nhà Lê..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Link ảnh chân dung</label>
                        <input type="text" value={figureFormData.avatar} onChange={(e) => setFigureFormData({ ...figureFormData, avatar: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Mô tả tiểu sử</label>
                      <textarea required value={figureFormData.description} onChange={(e) => setFigureFormData({ ...figureFormData, description: e.target.value })} className="w-full h-24 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Thành tựu tiêu biểu (Mỗi dòng một thành tựu)</label>
                      <textarea required value={figureFormData.achievements} onChange={(e) => setFigureFormData({ ...figureFormData, achievements: e.target.value })} className="w-full h-32 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Thành tựu 1&#10;Thành tựu 2..." />
                    </div>
                  </>
                )}
                <div className="pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      editingItem ? 'Lưu thay đổi' : 'Thêm mới'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
