import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Download, 
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { User, Class, Lesson, Submission, Progress, Assignment } from '../../core/types';

export const LearningReports = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [allUsers, allClasses, allLessons, allSubmissions, allProgress, allAssignments] = await Promise.all([
      dataProvider.getList<User>('users'),
      dataProvider.getList<Class>('classes'),
      dataProvider.getList<Lesson>('lessons'),
      dataProvider.getList<Submission>('submissions'),
      dataProvider.getList<Progress>('progress'),
      dataProvider.getList<Assignment>('assignments')
    ]);
    setStudents(allUsers.filter(u => u.role === 'student'));
    setClasses(allClasses);
    setLessons(allLessons);
    setSubmissions(allSubmissions);
    setProgress(allProgress);
    setAssignments(allAssignments);
    console.log('[Debug] Students:', allUsers.filter(u => u.role === 'student'));
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const completionRate = progress.length > 0 
    ? Math.round((progress.filter(p => p.status === 'completed').length / progress.length) * 100) 
    : 0;

  const averageScore = submissions.filter(s => s.score !== undefined).length > 0
    ? (submissions.filter(s => s.score !== undefined).reduce((acc, s) => acc + (s.score || 0), 0) / submissions.filter(s => s.score !== undefined).length).toFixed(1)
    : 0;

  const lessonCounts = progress.reduce((acc, p) => {
    acc[p.lessonId] = (acc[p.lessonId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  const mostPopularLessonId = Object.keys(lessonCounts).reduce((a, b) => lessonCounts[a] > lessonCounts[b] ? a : b, '');
  const mostPopularLesson = lessons.find(l => l.id === mostPopularLessonId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Tiến độ học tập</h2>
        <button className="bg-white text-slate-700 px-4 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
          <Download size={18} /> Xuất báo cáo (Excel)
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Tỉ lệ hoàn thành trung bình</p>
          <p className="text-3xl font-bold text-emerald-600">{completionRate}%</p>
          <div className="mt-4 flex items-center gap-1 text-xs text-emerald-500 font-bold">
            <TrendingUp size={14} /> Dữ liệu thực tế
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Bài học phổ biến nhất</p>
          <p className="text-lg font-bold text-slate-800 line-clamp-1">{mostPopularLesson?.title || 'Chưa có dữ liệu'}</p>
          <p className="mt-4 text-xs text-slate-400">{lessonCounts[mostPopularLessonId] || 0} lượt học</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Điểm trung bình</p>
          <p className="text-3xl font-bold text-slate-800">{averageScore}</p>
          <p className="mt-4 text-xs text-slate-400">Trên tổng số bài nộp</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Tổng số bài nộp</p>
          <p className="text-3xl font-bold text-blue-600">{submissions.length}</p>
          <p className="mt-4 text-xs text-slate-400">Tất cả các lớp</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart Mockup */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 size={20} className="text-emerald-500" /> Biểu đồ tiến độ theo lớp
            </h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 focus:ring-0">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 pt-4">
            {classes.map((c, i) => (
              <div key={c.id} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full bg-slate-50 rounded-t-xl relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${[75, 60, 85, 45, 90][i % 5]}%` }}
                    className="w-full bg-emerald-500 rounded-t-xl transition-all group-hover:bg-emerald-600"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {[75, 60, 85, 45, 90][i % 5]}%
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs font-bold text-slate-500 truncate w-full text-center">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Học sinh tích cực nhất</h3>
          <div className="space-y-4">
            {students.slice(0, 5).sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0)).map((student, i) => (
              <div key={student.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{student.name}</p>
                  <p className="text-[10px] text-slate-400">{classes.find(c => c.id === student.classId)?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{student.progressPercent}%</p>
                  <p className="text-[10px] text-slate-400">Hoàn thành</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Chi tiết tiến độ học sinh</h3>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm học sinh..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Học sinh</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lớp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bài học đã hoàn thành</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm Quiz TB</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến độ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${student.id}/100/100`} alt={student.name} referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {classes.find(c => c.id === student.classId)?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {Math.floor((student.progressPercent || 0) / 10)} / 24
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-emerald-600">
                      {(submissions.filter(s => s.studentId === student.id && s.score !== undefined).reduce((acc, s) => acc + (s.score || 0), 0) / (submissions.filter(s => s.studentId === student.id && s.score !== undefined).length || 1)).toFixed(1)} / 10
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${student.progressPercent}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{student.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 ml-auto">
                      Chi tiết <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
