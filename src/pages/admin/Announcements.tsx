import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Bell,
  Users,
  User,
  Globe,
  Calendar,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Announcement } from '../../core/types';
import { formatDate } from '../../core/utils';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'students' | 'parents' | 'all'>('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await dataProvider.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setTitle(announcement.title);
      setContent(announcement.content);
      setTarget(announcement.target);
    } else {
      setEditingAnnouncement(null);
      setTitle('');
      setContent('');
      setTarget('all');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await dataProvider.updateAnnouncement(editingAnnouncement.id, {
          title,
          content,
          target
        });
      } else {
        await dataProvider.createAnnouncement({
          title,
          content,
          target,
          createdBy: 'Admin' // Should be current user name
        });
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await dataProvider.deleteAnnouncement(id);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'students': return <User size={16} />;
      case 'parents': return <Users size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'students': return 'Học sinh';
      case 'parents': return 'Phụ huynh';
      default: return 'Tất cả';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý thông báo</h1>
          <p className="text-slate-500 font-medium">Tạo và gửi thông báo đến học sinh & phụ huynh</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
        >
          <Plus size={20} />
          Tạo thông báo mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
            <Filter size={20} />
            Lọc theo đối tượng
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold">Đang tải dữ liệu...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <motion.div 
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    announcement.target === 'students' ? 'bg-blue-100 text-blue-600' :
                    announcement.target === 'parents' ? 'bg-purple-100 text-purple-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Bell size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black text-slate-800">{announcement.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                        announcement.target === 'students' ? 'bg-blue-50 text-blue-600' :
                        announcement.target === 'parents' ? 'bg-purple-50 text-purple-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {getTargetIcon(announcement.target)}
                        {getTargetLabel(announcement.target)}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(announcement.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        Bởi: {announcement.createdBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(announcement)}
                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-300 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Không tìm thấy thông báo</h3>
            <p className="text-slate-500 font-medium">Hãy tạo thông báo đầu tiên để gửi đến học sinh</p>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800">
                    {editingAnnouncement ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Tiêu đề thông báo</label>
                    <input 
                      required
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề..."
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Đối tượng nhận</label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['all', 'students', 'parents'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTarget(t)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                            target === t 
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100' 
                              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {getTargetIcon(t)}
                          <span className="text-[10px] font-black uppercase tracking-widest">{getTargetLabel(t)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nội dung thông báo</label>
                    <textarea 
                      required
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Nhập nội dung thông báo chi tiết tại đây..."
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      {editingAnnouncement ? 'Cập nhật' : 'Đăng thông báo'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
