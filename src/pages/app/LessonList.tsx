import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Circle,
  ArrowRight,
  PlayCircle,
  FileText,
  HelpCircle,
  MessageSquare,
  Map as MapIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Lesson, Progress, Topic } from '../../core/types';

export const LessonList = () => {
  const location = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    (location.state as any)?.selectedTopicId || null
  );
  const studentId = 'u2'; // Mock student ID

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const allLessons = await dataProvider.getList<Lesson>('lessons');
    const allTopics = await dataProvider.getList<Topic>('topics');
    const studentProgress = await dataProvider.getList<Progress>('progress');
    
    // Log for debugging
    console.log('[LessonList] All lessons:', allLessons);
    console.log('[LessonList] All topics:', allTopics);

    // Filter published lessons - more robust check
    const publishedLessons = allLessons.filter(l => {
      if (!l.status) return true; // Default to published if no status
      const s = String(l.status).toLowerCase().trim();
      return (
        s === 'published' || 
        s === 'công khai' || 
        s === 'đã xuất bản' || 
        s === 'xuất bản' || 
        s === 'đã đăng' || 
        s === 'active' || 
        s === 'hiện'
      );
    });
    
    setLessons(publishedLessons);
    setTopics(allTopics);
    setProgress(studentProgress.filter(p => p.studentId === studentId));

    // Select first topic by default if none selected and no state passed
    if (allTopics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(allTopics[0].id);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lessonId === lessonId);
  };

  const selectedTopic = topics.find(t => String(t.id) === String(selectedTopicId));
  const filteredLessons = lessons.filter(l => {
    const lessonTopicId = String(l.topicId).trim();
    const targetTopicId = String(selectedTopicId).trim();
    
    // Direct match
    if (lessonTopicId === targetTopicId) return true;
    
    // Match by topic title (e.g., lesson has "Chủ đề 1", topic title is "Chủ đề 1: ...")
    if (selectedTopic && selectedTopic.title.toLowerCase().includes(lessonTopicId.toLowerCase())) return true;
    
    // Reverse match: topic title contains lesson topic ID
    if (selectedTopic && lessonTopicId.toLowerCase().includes(selectedTopic.title.toLowerCase())) return true;

    // Match by topic order
    const topicIndex = topics.findIndex(t => String(t.id) === targetTopicId);
    if (topicIndex !== -1 && lessonTopicId === String(topicIndex + 1)) return true;
    
    // Match by numeric ID if topicId is like "t1" and lesson has "1"
    if (targetTopicId.startsWith('t') && lessonTopicId === targetTopicId.substring(1)) return true;

    return false;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 size={14} /> Đã hoàn thành
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold">
            <Clock size={14} /> Đang học
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold">
            <Circle size={14} /> Chưa học
          </span>
        );
    }
  };

  const getLessonTypeIcon = (lesson: Lesson) => {
    if (lesson.videoUrl) return <PlayCircle size={18} className="text-blue-500" />;
    return <FileText size={18} className="text-slate-400" />;
  };

  const calculateTotalProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = progress.filter(p => p.status === 'completed').length;
    return Math.round((completed / lessons.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header & Progress Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-black">Thư viện bài học di sản</h2>
            <p className="text-emerald-50 opacity-90">Khám phá kho tàng tri thức về lịch sử và địa lý quê hương</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 min-w-[280px]">
            <div className="flex justify-between text-sm font-black mb-2">
              <span>Tiến độ học tập</span>
              <span>{calculateTotalProgress()}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calculateTotalProgress()}%` }}
                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
            </div>
            <p className="text-xs mt-3 font-bold opacity-80">
              Đã hoàn thành {progress.filter(p => p.status === 'completed').length}/{lessons.length} bài học
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Topics List */}
        <div className="lg:col-span-4 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-800">Chủ đề bài học</h3>
          </div>
          <div className="p-4 space-y-2">
            {topics.map((topic, index) => (
              <div 
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                  selectedTopicId === topic.id 
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-black w-6 h-6 rounded-lg flex items-center justify-center ${
                    selectedTopicId === topic.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-bold">{topic.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Lessons Table */}
        <div className="lg:col-span-8 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              Các tiết học: <span className="text-emerald-600">{selectedTopic?.title}</span>
            </h3>
          </div>

          <div className="p-8">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-7">Tiêu đề tiết học</div>
              <div className="col-span-2">Loại</div>
              <div className="col-span-3 text-right">Trạng thái</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-50">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => {
                  const lessonProgress = getLessonProgress(lesson.id);
                  return (
                    <div key={lesson.id} className="grid grid-cols-12 gap-4 py-6 items-center hover:bg-slate-50/50 transition-all group">
                      <div className="col-span-7">
                        <Link 
                          to={`/app/lessons/${lesson.id}`}
                          className="font-bold text-slate-800 hover:text-emerald-600 transition-colors block"
                        >
                          {lesson.title}
                        </Link>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-slate-500 text-sm">
                        {getLessonTypeIcon(lesson)}
                        <span className="capitalize">{lesson.videoUrl ? 'video' : 'văn bản'}</span>
                      </div>
                      <div className="col-span-3 text-right">
                        {getStatusBadge(lessonProgress?.status)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-bold">Chưa có bài học nào trong chủ đề này em nhé!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
