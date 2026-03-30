import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Play, 
  ExternalLink,
  MessageCircle,
  Trophy,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Lesson, Progress, Heritage, HistoricalFigure, User } from '../../core/types';
import { ExpandableText } from '../../components/ExpandableText';

export const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const studentId = 'u2'; // Mock student ID

  useEffect(() => {
    if (lessonId) {
      fetchData();
    }
  }, [lessonId]);

  const fetchData = async () => {
    try {
      const l = await dataProvider.getOne<Lesson>('lessons', lessonId!);
      setLesson(l);

      const allProgress = await dataProvider.getList<Progress>('progress');
      const p = allProgress.find(item => item.lessonId === lessonId && item.studentId === studentId);
      setProgress(p || null);

      if (l.relatedHeritageIds?.length) {
        const allHeritages = await dataProvider.getList<Heritage>('heritages');
        setHeritages(allHeritages.filter(h => l.relatedHeritageIds?.includes(h.id)));
      }

      if (l.relatedHistoricalFigureIds?.length) {
        const allFigures = await dataProvider.getList<HistoricalFigure>('historicalFigures');
        setFigures(allFigures.filter(f => l.relatedHistoricalFigureIds?.includes(f.id)));
      }

      // Mark as in-progress if not started
      if (!p) {
        const newProgress: Progress = {
          id: Math.random().toString(36).substr(2, 9),
          studentId,
          lessonId: lessonId!,
          status: 'in-progress',
          startedAt: Date.now()
        };
        await dataProvider.create('progress', newProgress);
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (progress && progress.status !== 'completed') {
      try {
        await dataProvider.update('progress', progress.id, {
          status: 'completed',
          completedAt: Date.now()
        });
        setProgress({ ...progress, status: 'completed', completedAt: Date.now() });

        // Update user progress percent
        const user = await dataProvider.getOne<User>('users', studentId);
        if (user) {
          const allLessons = await dataProvider.getList<Lesson>('lessons');
          const publishedLessons = allLessons.filter(l => l.status === 'published');
          const allProgress = await dataProvider.getList<Progress>('progress');
          const completedLessons = allProgress.filter(p => p.studentId === studentId && p.status === 'completed');
          
          const newPercent = Math.round((completedLessons.length / publishedLessons.length) * 100);
          await dataProvider.update<User>('users', studentId, {
            ...user,
            progressPercent: newPercent
          });
        }

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (error) {
        console.error('Error completing lesson:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy bài học</h2>
        <Link to="/app/lessons" className="text-emerald-500 font-bold mt-4 inline-block">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/app/lessons" 
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Quay lại thư viện
        </Link>
        {progress?.status === 'completed' && (
          <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl font-bold border border-emerald-100">
            <CheckCircle2 size={20} /> Em đã hoàn thành bài học này!
          </span>
        )}
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="relative h-[400px]">
          <img 
            src={lesson.imageUrl || 'https://picsum.photos/seed/lesson/1200/600'} 
            alt={lesson.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-sm font-bold mb-4 inline-block">
              {lesson.topicId === 't1' ? 'Lịch sử Việt Nam' : lesson.topicId === 't2' ? 'Địa lý Việt Nam' : 'Văn hóa & Di sản'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold">{lesson.title}</h1>
          </div>
        </div>
        <div className="p-10">
          <p className="text-xl text-slate-600 leading-relaxed font-medium italic mb-8 border-l-4 border-emerald-500 pl-6">
            {lesson.shortDescription}
          </p>
          
          {/* Main Content */}
          <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: lesson.content.includes('<p>') || lesson.content.includes('<br') 
                  ? lesson.content 
                  : lesson.content.replace(/\n/g, '<br/>') 
              }} />
            ) : (
              <p className="text-slate-500 italic">Nội dung bài học đang được cập nhật...</p>
            )}
          </div>

          {/* Video Section */}
          {lesson.videoUrl && (
            <div className="mt-12 space-y-4">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Play className="text-red-500 fill-red-500" size={24} /> Video minh họa
              </h3>
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <iframe 
                  src={lesson.videoUrl} 
                  className="w-full h-full" 
                  allowFullScreen 
                  title="Lesson Video"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Heritage Sites */}
      {heritages.length > 0 && (
        <div className="mb-12 space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 px-4">
            <MapPin className="text-emerald-500" size={24} /> Khám phá các địa danh liên quan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heritages.map(h => (
              <motion.div 
                key={h.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex gap-6 h-full"
              >
                <img src={h.imageUrl || undefined} alt={h.name} className="w-32 h-32 rounded-2xl object-cover shadow-md shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 space-y-2 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-800">{h.name}</h4>
                  <div className="flex-1">
                    <ExpandableText text={h.description} limit={100} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-auto">
                    <MapPin size={14} /> {h.location}
                  </div>
                  <Link 
                    to="/app/map" 
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline pt-2"
                  >
                    Xem trên bản đồ <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Related Historical Figures */}
      {figures.length > 0 && (
        <div className="mb-12 space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 px-4">
            <Users className="text-emerald-500" size={24} /> Các nhân vật lịch sử em cần biết
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {figures.map(f => (
              <motion.div 
                key={f.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex gap-6 h-full"
              >
                <img src={f.avatar || undefined} alt={f.name} className="w-32 h-32 rounded-2xl object-cover shadow-md shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 space-y-2 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-800">{f.name}</h4>
                  <div className="flex-1">
                    <ExpandableText text={f.description} limit={100} />
                  </div>
                  <div className="pt-2 mt-auto">
                    <Link 
                      to="/app/ai-chat" 
                      className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                    >
                      <MessageCircle size={14} /> Nhân vật Lịch sử
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Reference Links */}
      {lesson.referenceLinks && lesson.referenceLinks.length > 0 && (
        <div className="mb-12 bg-slate-50 rounded-[32px] p-8 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ExternalLink size={20} className="text-slate-400" /> Tài liệu tham khảo thêm
          </h3>
          <ul className="space-y-3">
            {lesson.referenceLinks.map((link, i) => (
              <li key={i}>
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 underline decoration-emerald-200 underline-offset-4"
                >
                  <ChevronRight size={16} /> {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion Button */}
      <div className="sticky bottom-8 left-0 right-0 px-4 flex justify-center pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          disabled={progress?.status === 'completed'}
          className={`
            pointer-events-auto flex items-center gap-3 px-10 py-5 rounded-[24px] font-bold text-xl shadow-2xl transition-all
            ${progress?.status === 'completed'
              ? 'bg-emerald-100 text-emerald-600 cursor-default'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
            }
          `}
        >
          {progress?.status === 'completed' ? (
            <>
              <CheckCircle2 size={28} /> Em đã hoàn thành bài học 🎉
            </>
          ) : (
            <>
              <Trophy size={28} /> Đánh dấu đã hoàn thành bài học
            </>
          )}
        </motion.button>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-white/40 backdrop-blur-sm"
          >
            <div className="bg-white p-12 rounded-[48px] shadow-2xl text-center space-y-6 border-4 border-emerald-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-800">Chúc mừng em! 🎉</h2>
              <p className="text-xl text-slate-600 font-medium">Em đã hoàn thành xuất sắc bài học này.</p>
              <button 
                onClick={() => setShowConfetti(false)}
                className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 pointer-events-auto"
              >
                Tiếp tục khám phá
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
