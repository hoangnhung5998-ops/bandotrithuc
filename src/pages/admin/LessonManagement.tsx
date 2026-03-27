import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Image as ImageIcon, 
  Video, 
  X,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Users,
  Layers,
  Layout,
  Leaf,
  Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Lesson, Heritage, HistoricalFigure, Topic } from '../../core/types';
import { getGoogleDriveDirectLink, ensureProtocol, getYoutubeEmbedLink } from '../../core/utils';
import { toast } from 'sonner';

export const LessonManagement = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    topicId: '',
    shortDescription: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    relatedHeritageIds: [] as string[],
    relatedHistoricalFigureIds: [] as string[],
    referenceLinks: [] as string[],
    status: 'draft' as 'draft' | 'published',
    order: 1,
  });

  const [topicFormData, setTopicFormData] = useState({
    title: '',
    description: '',
    icon: 'Layout',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allLessons, allHeritages, allFigures, allTopics] = await Promise.all([
        dataProvider.getList<Lesson>('lessons', { forceRealTime: true }),
        dataProvider.getList<Heritage>('heritages', { forceRealTime: true }),
        dataProvider.getList<HistoricalFigure>('historicalFigures', { forceRealTime: true }),
        dataProvider.getList<Topic>('topics', { forceRealTime: true })
      ]);
      setLessons(allLessons.sort((a, b) => {
        if (a.topicId !== b.topicId) {
          return a.topicId.localeCompare(b.topicId);
        }
        return a.order - b.order;
      }));
      setHeritages(allHeritages);
      setFigures(allFigures);
      setTopics(allTopics);
      
      if (allTopics.length > 0 && !selectedTopicId) {
        setSelectedTopicId(allTopics[0].id);
      }
      
      // Set default topicId if not set
      if (allTopics.length > 0 && !formData.topicId) {
        setFormData(prev => ({ ...prev, topicId: allTopics[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu bài học.');
    }
  };

  const handleOpenModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        topicId: lesson.topicId,
        shortDescription: lesson.shortDescription,
        content: lesson.content,
        imageUrl: lesson.imageUrl || '',
        videoUrl: lesson.videoUrl || '',
        relatedHeritageIds: lesson.relatedHeritageIds || [],
        relatedHistoricalFigureIds: lesson.relatedHistoricalFigureIds || [],
        referenceLinks: lesson.referenceLinks || [],
        status: lesson.status,
        order: lesson.order || 1,
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        topicId: topics[0]?.id || 't1',
        shortDescription: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        relatedHeritageIds: [],
        relatedHistoricalFigureIds: [],
        referenceLinks: [],
        status: 'draft',
        order: lessons.filter(l => l.topicId === (topics[0]?.id || 't1')).length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleAddLessonToTopic = (topicId: string) => {
    setEditingLesson(null);
    const topicLessons = lessons.filter(l => l.topicId === topicId);
    setFormData({
      title: '',
      topicId: topicId,
      shortDescription: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
      relatedHeritageIds: [],
      relatedHistoricalFigureIds: [],
      referenceLinks: [],
      status: 'draft',
      order: topicLessons.length + 1,
    });
    setIsTopicModalOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenTopicModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicFormData({
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
      });
    } else {
      setEditingTopic(null);
      setTopicFormData({
        title: '',
        description: '',
        icon: 'Layout',
      });
    }
    setIsTopicModalOpen(true);
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      await dataProvider.update('topics', editingTopic.id, topicFormData);
    } else {
      await dataProvider.create('topics', { ...topicFormData, id: `t${Date.now()}` });
    }
    setIsTopicModalOpen(false);
    fetchData();
  };

  const handleTopicDelete = async (id: string) => {
    const hasLessons = lessons.some(l => l.topicId === id);
    if (hasLessons) {
      alert('Không thể xóa chủ đề này vì vẫn còn bài học thuộc chủ đề. Vui lòng xóa hoặc chuyển bài học sang chủ đề khác trước.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      await dataProvider.delete('topics', id);
      if (selectedTopicId === id) {
        setSelectedTopicId(null);
      }
      fetchData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Process URLs
    const processedFormData = {
      ...formData,
      imageUrl: getGoogleDriveDirectLink(ensureProtocol(formData.imageUrl)),
      videoUrl: getYoutubeEmbedLink(ensureProtocol(formData.videoUrl)),
      referenceLinks: formData.referenceLinks.map(link => ensureProtocol(link))
    };

    const data = {
      ...processedFormData,
      createdAt: editingLesson ? editingLesson.createdAt : Date.now(),
    };

    console.log('Saving lesson data:', data);

    try {
      if (editingLesson) {
        const updated = await dataProvider.update<Lesson>('lessons', editingLesson.id, data);
        toast.success('Cập nhật bài học thành công!');
        setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...updated, id: editingLesson.id } : l));
      } else {
        const created = await dataProvider.create<Lesson>('lessons', data);
        toast.success('Tạo bài học mới thành công!');
        setLessons(prev => [...prev, created]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Lỗi khi lưu bài học:', error);
      toast.error('Không thể lưu bài học. Vui lòng kiểm tra lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      await dataProvider.delete('lessons', id);
      fetchData();
    }
  };

  const toggleStatus = async (lesson: Lesson) => {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published';
    await dataProvider.update('lessons', lesson.id, { status: newStatus });
    fetchData();
  };

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || 
                         l.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = selectedTopicId === 'all' || (() => {
      const lessonTopicId = String(l.topicId);
      const targetTopicId = String(selectedTopicId);
      
      // Direct match
      if (lessonTopicId === targetTopicId) return true;
      
      // Match by topic title
      const selectedTopic = topics.find(t => String(t.id) === targetTopicId);
      if (selectedTopic && selectedTopic.title.toLowerCase().includes(lessonTopicId.toLowerCase())) return true;
      
      // Match by topic order
      const topicIndex = topics.findIndex(t => String(t.id) === targetTopicId);
      if (topicIndex !== -1 && lessonTopicId === String(topicIndex + 1)) return true;
      
      return false;
    })();
    return matchesSearch && matchesTopic;
  });

  const getTopicName = (id: string | null) => {
    if (!id) return '';
    const topic = topics.find(t => t.id === id);
    return topic ? topic.title : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1e293b]">Quản lý Chủ đề & Bài giảng</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Topics */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-slate-700">Chủ đề bài học</h3>
              <button 
                onClick={() => handleOpenTopicModal()}
                className="text-sky-500 hover:bg-sky-50 p-1.5 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {topics.map((topic, index) => (
                <div 
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selectedTopicId === topic.id 
                      ? 'bg-sky-50 text-sky-700' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm font-medium shrink-0">{index + 1}.</span>
                    <span className="text-sm font-medium truncate">{topic.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTopicModal(topic);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedTopicId === topic.id 
                          ? 'text-sky-500 hover:bg-sky-100' 
                          : 'text-slate-400 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicDelete(topic.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedTopicId === topic.id 
                          ? 'text-red-500 hover:bg-red-100' 
                          : 'text-slate-400 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Lessons */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <h3 className="font-bold text-slate-700">
                Các tiết học: <span className="text-slate-500 font-medium">{getTopicName(selectedTopicId)}</span>
              </h3>
              <button 
                onClick={() => handleAddLessonToTopic(selectedTopicId || '')}
                className="bg-[#0284c7] text-white px-4 py-2 rounded-lg font-bold hover:bg-sky-700 transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Thêm tiết học
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề tiết học</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLessons.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 text-sm">
                          {lesson.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500">
                          {lesson.videoUrl ? 'video' : 'văn bản'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lesson.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lesson.status === 'published' ? 'Đã Xuất bản' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(lesson)}
                          className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Sửa tiết học"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lesson.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa tiết học"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLessons.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm italic">
                  Chưa có tiết học nào trong chủ đề này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editingLesson ? 'Cập nhật bài học' : 'Tạo bài học mới'}</h3>
                  <p className="text-sm text-slate-500">Điền đầy đủ thông tin bài học bên dưới</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tiêu đề bài học</label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="VD: Văn minh Sông Hồng" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Mô tả ngắn</label>
                      <textarea required value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Tóm tắt nội dung bài học..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Chủ đề</label>
                        <select 
                          value={formData.topicId} 
                          onChange={(e) => {
                            const newTopicId = e.target.value;
                            const topicLessons = lessons.filter(l => l.topicId === newTopicId);
                            setFormData({ 
                              ...formData, 
                              topicId: newTopicId,
                              order: topicLessons.length + 1
                            });
                          }} 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          {topics.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Thứ tự bài (VD: Bài 1, 2...)</label>
                        <input 
                          type="number" 
                          required 
                          value={formData.order} 
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })} 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" 
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="draft">Bản nháp</option>
                        <option value="published">Xuất bản</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><ImageIcon size={16} /> Link ảnh minh họa</label>
                      <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Video size={16} /> Link video minh họa (YouTube)</label>
                      <input type="text" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://www.youtube.com/watch?v=..." />
                      <p className="text-[10px] text-slate-400 italic">Dán link YouTube bất kỳ, hệ thống sẽ tự động chuyển đổi sang dạng nhúng.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><LinkIcon size={16} /> Link tham khảo (cách nhau bởi dấu phẩy)</label>
                      <input 
                        type="text" 
                        value={formData.referenceLinks.join(', ')} 
                        onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" 
                        placeholder="Link 1, Link 2..." 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nội dung bài học (HTML/Rich Text)</label>
                  <textarea 
                    required 
                    value={formData.content} 
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                    className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono text-sm" 
                    placeholder="<p>Nội dung bài học...</p>" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={18} className="text-emerald-500" /> Di sản liên quan</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl">
                      {heritages.map(h => (
                        <label key={h.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.relatedHeritageIds.includes(h.id)}
                            onChange={(e) => {
                              const ids = e.target.checked 
                                ? [...formData.relatedHeritageIds, h.id]
                                : formData.relatedHeritageIds.filter(id => id !== h.id);
                              setFormData({ ...formData, relatedHeritageIds: ids });
                            }}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-slate-700">{h.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-emerald-500" /> Nhân vật lịch sử liên quan</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl">
                      {figures.map(f => (
                        <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.relatedHistoricalFigureIds.includes(f.id)}
                            onChange={(e) => {
                              const ids = e.target.checked 
                                ? [...formData.relatedHistoricalFigureIds, f.id]
                                : formData.relatedHistoricalFigureIds.filter(id => id !== f.id);
                              setFormData({ ...formData, relatedHistoricalFigureIds: ids });
                            }}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-slate-700">{f.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all">Hủy</button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] bg-emerald-500 text-white py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      editingLesson ? 'Lưu thay đổi' : 'Tạo bài học'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Topic Management Modal */}
      <AnimatePresence>
        {isTopicModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTopicModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editingTopic ? 'Sửa chủ đề' : 'Thêm chủ đề mới'}</h3>
                </div>
                <button onClick={() => setIsTopicModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <div className="p-6 overflow-auto flex-1 space-y-6">
                <form onSubmit={handleTopicSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tên chủ đề</label>
                    <input 
                      type="text" 
                      required 
                      value={topicFormData.title} 
                      onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                      placeholder="VD: Địa phương em"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mô tả</label>
                    <textarea 
                      value={topicFormData.description} 
                      onChange={(e) => setTopicFormData({ ...topicFormData, description: e.target.value })}
                      className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 resize-none"
                      placeholder="Mô tả ngắn về chủ đề..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Icon</label>
                    <select 
                      value={topicFormData.icon} 
                      onChange={(e) => setTopicFormData({ ...topicFormData, icon: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="Layout">Mặc định</option>
                      <option value="MapPin">Địa điểm</option>
                      <option value="Leaf">Thiên nhiên</option>
                      <option value="Library">Văn hóa</option>
                      <option value="BookOpen">Học tập</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsTopicModalOpen(false)} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all">Hủy</button>
                    <button type="submit" className="flex-[2] bg-sky-500 text-white py-3 rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100">
                      {editingTopic ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>

                  {editingTopic && (
                    <button 
                      type="button"
                      onClick={() => handleTopicDelete(editingTopic.id)}
                      className="w-full mt-4 flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:underline"
                    >
                      <Trash2 size={14} /> Xóa chủ đề này
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
