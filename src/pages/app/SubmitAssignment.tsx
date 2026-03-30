import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Star,
  MessageSquare
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Assignment, Submission, Lesson } from '../../core/types';
import { formatDate, formatDateTime, ensureArray } from '../../core/utils';

export const SubmitAssignment = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const currentUser = await dataProvider.getCurrentUser();
      if (!currentUser) return;

      const [allAssignments, studentSubmissions, allLessons] = await Promise.all([
        dataProvider.getList<Assignment>('assignments'),
        dataProvider.getStudentSubmissions(currentUser.id),
        dataProvider.getList<Lesson>('lessons')
      ]);

      const currentAssignment = allAssignments.find(a => a.id === assignmentId);
      if (currentAssignment) {
        setAssignment(currentAssignment);
        const currentSubmission = studentSubmissions.find(s => s.assignmentId === assignmentId);
        if (currentSubmission) {
          setSubmission(currentSubmission);
          setContent(currentSubmission.content);
          setFileUrl(currentSubmission.fileUrl || '');
        }
        const currentLesson = allLessons.find(l => l.id === currentAssignment.lessonId);
        setLesson(currentLesson || null);
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    setSubmitting(true);
    setError(null);

    try {
      const currentUser = await dataProvider.getCurrentUser();
      if (!currentUser) return;

      await dataProvider.submitAssignment(currentUser.id, assignment.id, content, fileUrl);
      await fetchData();
      // Show success message or navigate
    } catch (err) {
      setError('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  if (!assignment) return <div className="text-center py-20"><h3 className="text-xl font-bold text-slate-400">Không tìm thấy bài tập</h3><Link to="/app/assignments" className="text-emerald-600 font-bold hover:underline">Quay lại danh sách</Link></div>;

  const isGraded = submission?.score !== undefined;
  const isSubmitted = !!submission;
  
  const dueDate = assignment ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && !isNaN(dueDate.getTime()) && dueDate < new Date() && !isSubmitted;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Link to="/app/assignments" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-colors">
        <ArrowLeft size={20} /> Quay lại danh sách bài tập
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">{assignment.title}</h2>
                <p className="text-slate-500 text-sm">{lesson?.title || 'Bài học chung'}</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-8">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <Clock className="text-slate-400" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hạn nộp</p>
                  <p className="text-sm font-bold text-slate-700">{formatDate(assignment.dueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <Star className="text-amber-400" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm tối đa</p>
                  <p className="text-sm font-bold text-slate-700">{assignment.maxScore} điểm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" /> Tiêu chí đánh giá
            </h3>
            <div className="space-y-4">
              {ensureArray<any>(assignment.rubrics).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{i + 1}. {r.criterion}</span>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{r.maxScore}đ</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Form / Status */}
        <div className="space-y-8">
          {isGraded ? (
            <div className="bg-emerald-50 rounded-[40px] p-8 border-2 border-emerald-100 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 mb-4">
                  <Star size={40} />
                </div>
                <h3 className="text-xl font-black text-emerald-800">Kết quả của em</h3>
                <div className="text-4xl font-black text-emerald-600">
                  {submission?.score}<span className="text-lg text-emerald-400">/{assignment.maxScore}</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <MessageSquare size={16} /> Lời nhắn từ thầy cô:
                </p>
                <div className="bg-white/50 p-4 rounded-2xl text-sm text-emerald-700 italic">
                  "{submission?.feedback}"
                </div>
              </div>
            </div>
          ) : isSubmitted ? (
            <div className="bg-blue-50 rounded-[40px] p-8 border-2 border-blue-100 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-200 mb-4">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-xl font-black text-blue-800">Đã nộp bài!</h3>
                <p className="text-sm text-blue-600">Thầy cô đang chấm bài cho em nhé. Hãy kiên nhẫn đợi một chút!</p>
              </div>
              
              <div className="pt-6 border-t border-blue-200">
                <p className="text-xs font-bold text-blue-400 mb-2">Nộp lúc: {formatDateTime(submission!.submittedAt)}</p>
                <button 
                  onClick={() => {
                    // Allow editing if not graded?
                    // For now, just show it's submitted
                  }}
                  className="w-full py-4 rounded-2xl bg-white text-blue-600 font-bold text-sm border border-blue-200 hover:bg-blue-100 transition-all"
                >
                  Xem lại bài làm
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Nộp bài làm</h3>
              
              {isOverdue && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                  <AlertCircle size={16} /> Bài tập đã quá hạn nộp!
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nội dung trả lời</label>
                  <textarea 
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                    placeholder="Nhập nội dung bài làm của em tại đây..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <LinkIcon size={14} /> Link đính kèm (nếu có)
                  </label>
                  <input 
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : <><Send size={20} /> Nộp bài ngay</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
