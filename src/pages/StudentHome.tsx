import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Clock, 
  Star, 
  ArrowRight, 
  Play, 
  Bell, 
  Search, 
  MapPin, 
  Users, 
  Sparkles,
  ChevronRight,
  Calendar,
  X,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../core/provider';
import { Lesson, Heritage, HistoricalFigure, Announcement, User, Class } from '../core/types';
import { formatDate } from '../core/utils';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export const StudentHome = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [l, h, f, a, cachedUser] = await Promise.all([
        dataProvider.getList<Lesson>('lessons'),
        dataProvider.getList<Heritage>('heritages'),
        dataProvider.getList<HistoricalFigure>('historicalFigures'),
        dataProvider.getAnnouncements(),
        dataProvider.getCurrentUser()
      ]);

      setLessons(l);
      setHeritages(h);
      setFigures(f);
      setAnnouncements(a.filter(item => item.target === 'students' || item.target === 'all').slice(0, 3));
      
      if (cachedUser) {
        setUser(cachedUser);
        // Refresh from server to get latest classId
        try {
          const latestUser = await dataProvider.getOne<User>('users', cachedUser.id, { forceRealTime: true });
          if (latestUser) {
            setUser(latestUser);
            localStorage.setItem('heritage_current_user', JSON.stringify(latestUser));
          }
        } catch (err) {
          console.error('Error refreshing user data:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode) return;

    setJoining(true);
    try {
      const classes = await dataProvider.getList<Class>('classes');
      const targetClass = classes.find(c => c.joinCode === joinCode.toUpperCase());

      if (!targetClass) {
        toast.error('Mã tham gia không chính xác. Vui lòng kiểm tra lại.');
        return;
      }

      await dataProvider.update('users', user.id, {
        ...user,
        classId: targetClass.id
      });

      // Update local storage and state
      const updatedUser = { ...user, classId: targetClass.id };
      localStorage.setItem('heritage_current_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success(`Chúc mừng! Bạn đã tham gia lớp ${targetClass.name}`);
      setIsJoinModalOpen(false);
      setJoinCode('');
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Có lỗi xảy ra khi tham gia lớp học.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-8">
      {/* Top Row: Hero & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[300px]">
        {/* Hero Section - More Compact */}
        <section className="lg:col-span-8 relative overflow-hidden rounded-[32px] bg-slate-900 flex items-center shadow-xl">
          {/* Background with overlay */}
          <div className="absolute inset-0">
            <img 
              src="https://lh3.googleusercontent.com/d/1Uebe03dN2MbG8GGXrczhzP6P70pAURHY" 
              alt="Background" 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b] via-[#064e3b]/30 to-transparent"></div>
          </div>

          <div className="relative z-10 px-10 py-8 w-full flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 relative">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1VWaxXcAIO58YPKVWb6wKeiBtDcIF65OM" 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-white font-black text-xl tracking-tight leading-none">Bản đồ Tri thức</h2>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">Học tập thông minh</p>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                  Chào mừng, <span className="text-emerald-400">{user?.name || 'Học sinh'}</span>
                </h1>
                <p className="text-lg text-slate-200 font-bold opacity-90">
                  {user?.classId ? `Lớp ${user.classId}` : 'Chưa tham gia lớp học'} • {user?.school || 'TH Tân Long'}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => navigate('/app/lessons')}
                  className="px-6 py-3 bg-[#10b981] text-white rounded-2xl font-black text-sm hover:bg-[#059669] transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                  Học ngay <ArrowRight size={18} />
                </button>
                {!user?.classId && (
                  <button 
                    onClick={() => setIsJoinModalOpen(true)}
                    className="px-6 py-3 bg-white text-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 active:scale-95"
                  >
                    Tham gia lớp <Users size={18} />
                  </button>
                )}
                <button 
                  onClick={() => navigate('/app/heritages')}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-sm hover:bg-white/20 transition-all active:scale-95"
                >
                  Di sản số
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Card - Compact */}
        <section className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">TIẾN ĐỘ HÀNH TRÌNH</p>
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <p className="text-6xl font-black text-slate-800 leading-none">{user?.progressPercent || 0}%</p>
                <p className="text-emerald-600 font-black text-xs mb-1">HOÀN THÀNH</p>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${user?.progressPercent || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
            <div className="w-12 h-12 bg-amber-400 text-amber-900 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">ĐIỂM THƯỞNG</p>
              <p className="text-xl font-black text-slate-800">1,250</p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row: Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Features & Learning */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          {/* Quick Nav - Horizontal Strip */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <Link to="/app/lessons" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Book size={20} />
              </div>
              <span className="font-black text-slate-800 text-sm">Bài học</span>
            </Link>
            <Link to="/app/ai-chat" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-black text-slate-800 text-sm">Nhân vật</span>
            </Link>
            <Link to="/app/games" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Play size={20} />
              </div>
              <span className="font-black text-slate-800 text-sm">Trò chơi</span>
            </Link>
          </div>

          {/* Featured & Continue - Side by Side */}
          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Featured Heritage */}
            <section className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800">Di sản nổi bật</h3>
                <Link to="/app/map" className="text-emerald-600 text-xs font-bold">Xem bản đồ</Link>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden rounded-2xl relative group">
                <img 
                  src={heritages[0]?.imageUrl || 'https://picsum.photos/seed/heritage/400/300'} 
                  alt="Heritage" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-white font-bold text-sm">{heritages[0]?.name}</h4>
                  <p className="text-white/70 text-[10px] line-clamp-1">{heritages[0]?.location}</p>
                </div>
              </div>
            </section>

            {/* Continue Learning */}
            <section className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800">Học tiếp</h3>
                <Link to="/app/lessons" className="text-emerald-600 text-xs font-bold">Tất cả</Link>
              </div>
              <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                {lessons.slice(0, 2).map(lesson => (
                  <div key={lesson.id} className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img src={lesson.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-black text-slate-800 line-clamp-1">{lesson.title}</h4>
                      <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <Link to={`/app/lessons/${lesson.id}`} className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0 self-center">
                      <Play size={14} fill="currentColor" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar (Figures & Announcements) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
          {/* Historical Figures */}
          <section className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col min-h-0">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-emerald-500" size={18} /> Nhân vật
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {figures.slice(0, 3).map(figure => (
                <Link key={figure.id} to="/app/ai-chat" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                    <img src={figure.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{figure.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{figure.title}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                </Link>
              ))}
            </div>
          </section>

          {/* Announcements - Compact */}
          <section className="bg-slate-900 rounded-[32px] p-6 text-white flex flex-col min-h-0">
            <h3 className="font-black text-sm mb-4 flex items-center gap-2">
              <Bell className="text-emerald-400" size={18} /> Thông báo
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {announcements.slice(0, 2).map(announcement => (
                <Link key={announcement.id} to="/app/announcements" className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                    {formatDate(announcement.createdAt)}
                  </p>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{announcement.title}</h4>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Join Class Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Tham gia lớp học</h3>
                    <p className="text-slate-500 text-xs font-bold">Nhập mã để bắt đầu học tập</p>
                  </div>
                </div>
                <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-xl transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleJoinClass} className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Mã tham gia lớp học</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="VÍ DỤ: CLASS123"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-slate-800 font-black text-lg placeholder:text-slate-300 uppercase"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold px-1">Mã tham gia được cung cấp bởi giáo viên của bạn.</p>
                </div>
                
                <button 
                  type="submit"
                  disabled={joining || !joinCode}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                >
                  {joining ? 'Đang kiểm tra...' : 'Tham gia ngay'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
