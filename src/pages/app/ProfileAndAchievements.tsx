import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Star,
  BookOpen,
  Calendar,
  MessageSquare,
  Trophy,
  CheckCircle2,
  Clock,
  Circle,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Submission, Assignment, Lesson, Progress, User as UserType, Certificate, Class } from '../../core/types';
import { formatDate } from '../../core/utils';
import { FileText, Download, ExternalLink, Eye } from 'lucide-react';

export const ProfileAndAchievements = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'achievements' | 'certificates'>('overview');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await dataProvider.getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      const userId = currentUser.id;
      setUser(currentUser);

      const [studentSubmissions, allAssignments, allLessons, allProgress, allCertificates, allClasses] = await Promise.all([
        dataProvider.getStudentSubmissions(userId),
        dataProvider.getList<Assignment>('assignments'),
        dataProvider.getList<Lesson>('lessons'),
        dataProvider.getList<Progress>('progress'),
        dataProvider.getList<Certificate>('certificates'),
        dataProvider.getList<Class>('classes')
      ]);
      
      setSubmissions(studentSubmissions.filter(s => s.score !== undefined));
      setAssignments(allAssignments);
      const publishedLessons = allLessons.filter(l => l.status === 'published');
      setLessons(publishedLessons);
      setProgress(allProgress.filter(p => p.studentId === userId));
      setCertificates(allCertificates.filter(c => c.studentId === userId));
      
      if (currentUser.classId) {
        const foundClass = allClasses.find(c => c.id === currentUser.classId);
        setStudentClass(foundClass || null);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length).toFixed(1)
    : 0;

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const totalLessons = lessons.length;
  const completionRate = user?.progressPercent !== undefined ? user.progressPercent : (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

  const getLessonStatus = (lessonId: string) => {
    const p = progress.find(item => item.lessonId === lessonId);
    return p ? p.status : 'not-started';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan & Tiến độ', icon: TrendingUp },
    { id: 'grades', label: 'Bảng điểm chi tiết', icon: Star },
    { id: 'achievements', label: 'Huy hiệu & Thành tích', icon: Trophy },
    { id: 'certificates', label: 'Giấy khen & Chứng nhận', icon: FileText },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-4xl font-black shadow-lg">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase() : 'HS'}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="text-center md:text-left space-y-2 flex-grow">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h2 className="text-3xl font-black text-slate-800">{user?.name || 'Học sinh'}</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              Đại sứ Di sản Cấp 5
            </span>
          </div>
          <p className="text-slate-500">{studentClass?.name || user?.class || 'Chưa xếp lớp'} • {user?.school || 'Trường Tiểu học Tân Long'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Zap size={18} className="text-orange-500" />
              <span className="font-bold">1,250 XP</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Trophy size={18} className="text-yellow-500" />
              <span className="font-bold">{certificates.length > 0 ? certificates.length : 12} Huy hiệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-[32px] shadow-sm border border-slate-100 sticky top-4 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <Award size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Điểm trung bình</p>
                  <p className="text-3xl font-black text-slate-800">{avgScore}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Đã hoàn thành</p>
                  <p className="text-3xl font-black text-slate-800">{completedCount}/{totalLessons}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ hoàn thành</p>
                  <p className="text-3xl font-black text-slate-800">{completionRate}%</p>
                </div>
              </div>
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'grades' && (
          <motion.div
            key="grades"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-slate-800 px-2">Chi tiết điểm số</h3>
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((submission, index) => {
                const assignment = assignments.find(a => a.id === submission.assignmentId);
                const lesson = lessons.find(l => l.id === assignment?.lessonId);

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="w-full md:w-auto flex-grow space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          {lesson?.title || 'Bài học chung'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(submission.gradedAt)}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">{assignment?.title}</h4>
                      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <MessageSquare size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-500 italic">"{submission.feedback}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 px-8 py-4 bg-emerald-50 rounded-3xl border border-emerald-100 min-w-[180px] justify-center">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Điểm số</p>
                        <div className="text-3xl font-black text-emerald-600">
                          {submission.score}<span className="text-sm text-emerald-400">/{assignment?.maxScore}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[
                { title: 'Người mới bắt đầu', icon: Zap, color: 'bg-orange-100 text-orange-500', unlocked: true },
                { title: 'Đại sứ Di sản', icon: Award, color: 'bg-emerald-100 text-emerald-500', unlocked: true },
                { title: 'Nhà thám hiểm', icon: BookOpen, color: 'bg-blue-100 text-blue-500', unlocked: true },
                { title: 'Chuyên gia Lịch sử', icon: Trophy, color: 'bg-yellow-100 text-yellow-500', unlocked: true },
                { title: 'Tay đua kiến thức', icon: Zap, color: 'bg-purple-100 text-purple-500', unlocked: true },
                { title: 'Người kể chuyện', icon: MessageSquare, color: 'bg-pink-100 text-pink-500', unlocked: false },
                { title: 'Bậc thầy bản đồ', icon: Star, color: 'bg-indigo-100 text-indigo-500', unlocked: false },
                { title: 'Chiến binh văn hóa', icon: ShieldCheck, color: 'bg-red-100 text-red-500', unlocked: false },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={badge.unlocked ? { scale: 1.05, rotate: 2 } : {}}
                  className={`relative p-6 rounded-[32px] border-2 flex flex-col items-center text-center space-y-3 transition-all ${
                    badge.unlocked 
                      ? 'bg-white border-slate-100 shadow-sm' 
                      : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${badge.color}`}>
                    <badge.icon size={40} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{badge.title}</h4>
                  {!badge.unlocked && (
                    <div className="absolute top-2 right-2">
                      <Clock size={16} className="text-slate-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[40px] text-white space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Trophy size={32} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Thử thách tuần này</h3>
                  <p className="text-slate-400">Hoàn thành để nhận huy hiệu giới hạn!</p>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Khám phá 3 di sản mới</span>
                  <span className="text-yellow-400 font-bold">2/3</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'certificates' && (
          <motion.div
            key="certificates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-emerald-100/50 transition-all"
                >
                  <div className="aspect-[1.4/1] relative bg-slate-100 overflow-hidden">
                    <img 
                      src={cert.imageUrl || 'https://picsum.photos/seed/cert/800/600'} 
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => setSelectedCert(cert)}
                        className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-xl hover:bg-emerald-50 transition-colors"
                      >
                        <Eye size={24} />
                      </button>
                      <button className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-colors">
                        <Download size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          cert.type === 'achievement' ? 'bg-amber-50 text-amber-600' :
                          cert.type === 'academic' ? 'bg-blue-50 text-blue-600' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {cert.type === 'achievement' ? 'Thành tích' :
                           cert.type === 'academic' ? 'Học tập' : 'Tham gia'}
                        </span>
                        <h4 className="text-xl font-black text-slate-800 leading-tight">{cert.title}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày cấp</p>
                        <p className="text-sm font-bold text-slate-600">{formatDate(cert.issuedAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {cert.description}
                    </p>
                    <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Cấp bởi: {cert.issuedBy}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {certificates.length === 0 && (
              <div className="py-20 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 space-y-4">
                <FileText size={48} className="mx-auto text-slate-200" />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-800">Chưa có giấy khen nào</h3>
                  <p className="text-slate-500">Hãy cố gắng học tập và tham gia các hoạt động để nhận giấy khen nhé!</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="flex-grow bg-slate-100 p-4 md:p-12 flex items-center justify-center">
                <img 
                  src={selectedCert.imageUrl} 
                  alt={selectedCert.title}
                  className="max-w-full max-h-[70vh] shadow-2xl rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-full md:w-96 p-10 space-y-8 bg-white border-l border-slate-100">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-800 leading-tight">{selectedCert.title}</h3>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mô tả thành tích</p>
                    <p className="text-slate-600 font-medium leading-relaxed">{selectedCert.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đơn vị cấp</p>
                      <p className="font-bold text-slate-700">{selectedCert.issuedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày cấp</p>
                      <p className="font-bold text-slate-700">{formatDate(selectedCert.issuedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-3">
                  <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200">
                    <Download size={20} /> Tải xuống bản in
                  </button>
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Đóng
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
