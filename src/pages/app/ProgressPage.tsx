import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Circle,
  TrendingUp,
  Star,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Lesson, Progress } from '../../core/types';

export const ProgressPage = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const studentId = 'u2'; // Mock student ID

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allLessons = await dataProvider.getList<Lesson>('lessons');
      const studentProgress = await dataProvider.getList<Progress>('progress');
      
      const publishedLessons = allLessons.filter(l => l.status === 'published');
      setLessons(publishedLessons);
      setProgress(studentProgress.filter(p => p.studentId === studentId));
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonStatus = (lessonId: string) => {
    const p = progress.find(item => item.lessonId === lessonId);
    return p ? p.status : 'not-started';
  };

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const inProgressCount = progress.filter(p => p.status === 'in-progress').length;
  const totalLessons = lessons.length;
  const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800">Hành trình khám phá của em 🚀</h2>
        <p className="text-slate-500 text-lg">Cùng xem em đã đi được bao xa trên con đường trở thành Đại sứ Di sản nhé!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center space-y-3"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <BookOpen size={32} />
          </div>
          <div className="text-3xl font-black text-slate-800">{totalLessons}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng số bài học</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center space-y-3"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Trophy size={32} />
          </div>
          <div className="text-3xl font-black text-slate-800">{completedCount}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Đã hoàn thành</div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center space-y-3"
        >
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={32} />
          </div>
          <div className="text-3xl font-black text-slate-800">{completionRate}%</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ hoàn thành</div>
        </motion.div>
      </div>

      {/* Progress Bar Large */}
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800">Tiến độ tổng quát</h3>
            <p className="text-slate-500">Em đang làm rất tốt, cố gắng lên nhé!</p>
          </div>
          <div className="text-4xl font-black text-emerald-500">{completionRate}%</div>
        </div>
        <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-inner"
          />
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Bắt đầu</span>
          <span>Đại sứ Di sản</span>
        </div>
      </div>

      {/* Lesson Status List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 px-4 flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" size={24} /> Chi tiết từng bài học
        </h3>
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {lessons.map((lesson) => {
              const status = getLessonStatus(lesson.id);
              return (
                <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {status === 'completed' ? <CheckCircle2 size={28} /> : 
                       status === 'in-progress' ? <Clock size={28} /> : 
                       <Circle size={28} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{lesson.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {lesson.topicId === 't1' ? 'Lịch sử' : lesson.topicId === 't2' ? 'Địa lý' : 'Văn hóa'}
                        </span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className={`text-xs font-bold ${
                          status === 'completed' ? 'text-emerald-500' :
                          status === 'in-progress' ? 'text-blue-500' :
                          'text-slate-400'
                        }`}>
                          {status === 'completed' ? 'Đã hoàn thành' :
                           status === 'in-progress' ? 'Đang học' :
                           'Chưa bắt đầu'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    {status === 'completed' ? (
                      <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 px-4 py-2 rounded-xl font-bold border border-yellow-100">
                        <Award size={18} /> +50 điểm
                      </div>
                    ) : (
                      <div className="text-slate-300 italic text-sm">Hoàn thành để nhận điểm</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
