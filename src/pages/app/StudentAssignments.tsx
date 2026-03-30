import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Calendar,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Assignment, Submission, Lesson, User, Class } from '../../core/types';
import { formatDate, ensureArray } from '../../core/utils';

export const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cachedUser = await dataProvider.getCurrentUser();
      if (!cachedUser) return;

      // Refresh user data from server to get latest classId
      let currentUser = cachedUser;
      try {
        const latestUser = await dataProvider.getOne<User>('users', cachedUser.id, { forceRealTime: true });
        if (latestUser) {
          currentUser = latestUser;
          localStorage.setItem('heritage_current_user', JSON.stringify(latestUser));
        }
      } catch (err) {
        console.error('Error refreshing user data in StudentAssignments:', err);
      }

      const [allAssignments, studentSubmissions, allLessons, allClasses] = await Promise.all([
        dataProvider.getList<Assignment>('assignments', { forceRealTime: true }),
        dataProvider.getStudentSubmissions(currentUser.id, { forceRealTime: true }),
        dataProvider.getList<Lesson>('lessons'),
        dataProvider.getList<Class>('classes')
      ]);

      console.log('StudentAssignments: Current User ClassId:', currentUser.classId);
      console.log('StudentAssignments: All Assignments:', allAssignments);

      // Find the student's class ID if they have a class name instead
      let studentClassId = currentUser.classId || '';
      const matchingClass = allClasses.find(c => c.name === studentClassId || c.id === studentClassId);
      if (matchingClass) {
        studentClassId = matchingClass.id;
      }

      // Filter assignments that include the student's classId
      const studentAssignments = allAssignments.filter(a => {
        const cIds = ensureArray(a.classIds);
        // Also check singular classId for backward compatibility
        const singularId = (a as any).classId;
        if (singularId && !cIds.includes(singularId)) {
          cIds.push(singularId);
        }
        return cIds.includes(studentClassId);
      });

      setAssignments(studentAssignments);
      setSubmissions(studentSubmissions);
      setLessons(allLessons);
    } catch (error) {
      console.error('Error fetching student assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignmentId === assignmentId);
    if (submission) {
      return (submission.score !== undefined && submission.score !== null) ? 'graded' : 'submitted';
    }
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment && new Date(assignment.dueDate).getTime() < Date.now()) {
      return 'overdue';
    }
    return 'pending';
  };

  const statusConfig = {
    graded: { 
      label: 'Đã chấm điểm', 
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: <Star size={14} />
    },
    submitted: { 
      label: 'Đã nộp bài', 
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      icon: <CheckCircle size={14} />
    },
    overdue: { 
      label: 'Quá hạn', 
      color: 'bg-red-50 text-red-600 border-red-100',
      icon: <AlertCircle size={14} />
    },
    pending: { 
      label: 'Chưa nộp', 
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: <Clock size={14} />
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bài tập của em</h2>
          <p className="text-slate-500">Hoàn thành các thử thách để nhận huy hiệu nhé!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment, index) => {
          const status = getStatus(assignment.id);
          const config = statusConfig[status];
          const lesson = lessons.find(l => l.id === assignment.lessonId);
          const submission = submissions.find(s => s.assignmentId === assignment.id);

          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${config.color}`}>
                  {config.icon} {config.label}
                </div>
                {status === 'graded' && (
                  <div className="text-emerald-600 font-black text-lg">
                    {submission?.score}<span className="text-xs text-emerald-400">/{assignment.maxScore}</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                {assignment.title}
              </h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                <BookOpen size={14} />
                <span>{lesson?.title || 'Bài học chung'}</span>
              </div>

              <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">
                {assignment.description}
              </p>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar size={14} />
                  <span>Hạn: {formatDate(assignment.dueDate)}</span>
                </div>
                <Link 
                  to={`/app/assignments/${assignment.id}`}
                  className="flex items-center gap-1 text-emerald-600 font-bold text-sm hover:underline"
                >
                  {status === 'pending' || status === 'overdue' ? 'Làm bài' : 'Xem lại'} <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">Hiện chưa có bài tập nào</h3>
          <p className="text-slate-400">Hãy quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
};
