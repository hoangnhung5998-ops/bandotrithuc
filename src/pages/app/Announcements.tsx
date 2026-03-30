import React, { useState, useEffect } from 'react';
import { 
  Bell,
  Calendar,
  User,
  Search,
  Filter,
  ChevronRight,
  Globe,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Announcement } from '../../core/types';
import { formatDate } from '../../core/utils';

export const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'students'>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await dataProvider.getAnnouncements();
      // Filter for students or all
      const studentData = data.filter(a => a.target === 'students' || a.target === 'all');
      setAnnouncements(studentData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    filter === 'all' ? true : a.target === 'students'
  );

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'students': return <User size={14} />;
      default: return <Globe size={14} />;
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'students': return 'Dành cho học sinh';
      default: return 'Thông báo chung';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Thông báo từ nhà trường</h1>
          <p className="text-slate-500 font-medium text-lg">Cập nhật những tin tức mới nhất dành cho em</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              filter === 'all' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('students')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              filter === 'students' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Học sinh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-500 font-black text-xl">Đang tải thông báo...</p>
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredAnnouncements.map((announcement, index) => (
            <motion.div 
              key={announcement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedAnnouncement(announcement)}
              className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${
                  announcement.target === 'students' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Bell size={32} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                      announcement.target === 'students' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {getTargetIcon(announcement.target)}
                      {getTargetLabel(announcement.target)}
                    </span>
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">
                    {announcement.title}
                  </h3>
                  
                  <p className="text-slate-600 text-lg line-clamp-2 mb-4 leading-relaxed">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center text-emerald-600 font-black gap-2 group-hover:gap-4 transition-all">
                    Xem chi tiết <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[60px] border border-dashed border-slate-300 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
            <Bell size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3">Chưa có thông báo mới</h3>
          <p className="text-slate-500 font-medium text-lg">Hãy quay lại sau để cập nhật những tin tức mới nhất nhé!</p>
        </div>
      )}

      {/* Announcement Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[50px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 sm:p-14">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    selectedAnnouncement.target === 'students' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Bell size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 leading-tight">
                      {selectedAnnouncement.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        {formatDate(selectedAnnouncement.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={16} />
                        Bởi: {selectedAnnouncement.createdBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-xl leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-full py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-lg hover:bg-slate-200 transition-all"
                  >
                    Đóng thông báo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
