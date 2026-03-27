import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  Star, 
  Award,
  Clock,
  Layout,
  Globe,
  Users,
  User,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Announcement, Lesson, Assignment } from '../../core/types';
import { formatDate } from '../../core/utils';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch announcements for students
      const annData = await dataProvider.getAnnouncements('students');
      setAnnouncements(annData.slice(0, 3)); // Only show top 3

      // Fetch recent lessons
      const lessons = await dataProvider.getList<Lesson>('lessons');
      setRecentLessons(lessons.slice(0, 3));

      // Fetch upcoming assignments
      const assignments = await dataProvider.getList<Assignment>('assignments');
      setUpcomingAssignments(assignments.filter(a => a.dueDate > Date.now()).slice(0, 2));
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] p-8 sm:p-12 text-white shadow-2xl shadow-emerald-200"
      >
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-widest mb-6">
            <Zap size={14} className="text-yellow-300" /> Chào mừng Đại sứ Di sản!
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            Khám phá lịch sử & địa lí Việt Nam cùng AI!
          </h1>
          <p className="text-emerald-50 text-lg mb-8 leading-relaxed opacity-90">
            Hôm nay bạn muốn tìm hiểu về vùng đất nào? Hãy bắt đầu hành trình trở thành Đại sứ Di sản ngay bây giờ.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/app/lessons" 
              className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              Học ngay <ChevronRight size={20} />
            </Link>
            <Link 
              to="/app/assignments" 
              className="px-8 py-4 bg-emerald-400/30 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-black hover:bg-emerald-400/40 transition-all flex items-center gap-2"
            >
              Xem bài tập
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Announcements & Lessons */}
        <div className="lg:col-span-2 space-y-10">
          {/* Announcements */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                Thông báo mới nhất
              </h2>
              <button className="text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((ann, idx) => (
                <motion.div 
                  key={ann.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                      <Bell size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{ann.title}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={12} /> {formatDate(ann.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {announcements.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">Chưa có thông báo nào mới.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Lessons */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                Bài học đề xuất
              </h2>
              <Link to="/app/lessons" className="text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors">
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentLessons.map((lesson, idx) => (
                <motion.div 
                  key={lesson.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
                >
                  <div className="h-40 bg-slate-200 relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${lesson.id}/400/300`} 
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-800">
                        {lesson.subject === 'history' ? 'Lịch sử' : 'Địa lí'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                    <Link 
                      to={`/app/lessons/${lesson.id}`}
                      className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-black hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      Bắt đầu học <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-10">
          {/* Upcoming Assignments */}
          <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center">
                <Award size={20} />
              </div>
              Bài tập sắp tới
            </h2>

            <div className="space-y-6">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="relative pl-6 border-l-2 border-slate-100 group">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-purple-500 transition-colors" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 group-hover:text-purple-600 transition-colors">{assignment.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={12} /> Hạn: {formatDate(assignment.dueDate)}
                    </div>
                  </div>
                  <Link 
                    to="/app/assignments"
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-purple-500 hover:gap-2 transition-all"
                  >
                    Nộp bài ngay <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
              {upcomingAssignments.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-xs font-bold">Không có bài tập nào sắp tới.</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Stats */}
          <section className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-200">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center">
                <Star size={20} />
              </div>
              Thành tích của bạn
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Điểm TB</p>
                <p className="text-2xl font-black text-emerald-400">8.5</p>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Xếp hạng</p>
                <p className="text-2xl font-black text-blue-400">#5</p>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Huy hiệu đã đạt</p>
                <div className="flex gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center border border-yellow-500/30">
                    <Award size={16} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/30">
                    <Globe size={16} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                    <Users size={16} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
