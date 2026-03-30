import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Star,
  BookOpen,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Submission, Assignment, Lesson } from '../../core/types';
import { formatDate } from '../../core/utils';

export const StudentGrades = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentId = 'student-1'; // Demo student
      const [studentSubmissions, allAssignments, allLessons] = await Promise.all([
        dataProvider.getStudentSubmissions(studentId),
        dataProvider.getList<Assignment>('assignments'),
        dataProvider.getList<Lesson>('lessons')
      ]);
      setSubmissions(studentSubmissions.filter(s => s.score !== undefined));
      setAssignments(allAssignments);
      setLessons(allLessons);
    } catch (error) {
      console.error('Error fetching student grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bảng điểm của em</h2>
          <p className="text-slate-500">Xem lại kết quả học tập và lời nhắn từ thầy cô</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Award size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Điểm trung bình</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-slate-800">{avgScore}</p>
              {parseFloat(avgScore as string) >= 8 ? (
                <TrendingUp size={20} className="text-emerald-500" />
              ) : (
                <TrendingDown size={20} className="text-amber-500" />
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bài đã hoàn thành</p>
            <p className="text-3xl font-black text-slate-800">{submissions.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Huy hiệu nhận được</p>
            <p className="text-3xl font-black text-slate-800">{Math.floor(submissions.length / 2)}</p>
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 px-2">Chi tiết điểm số</h3>
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

          {submissions.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Chưa có điểm bài tập nào</h3>
              <p className="text-slate-400">Hãy hoàn thành bài tập để nhận điểm nhé!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
