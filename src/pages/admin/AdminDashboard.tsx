import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Map as MapIcon, 
  Gamepad2, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { User, Class, Lesson, Heritage, Quiz } from '../../core/types';
import { formatDate } from '../../core/utils';

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number | string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    lessons: 0,
    activities: 0,
    quizzes: 0,
    completed: 0,
    notCompleted: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const classes = await dataProvider.getList<Class>('classes');
      const users = await dataProvider.getList<User>('users');
      const lessons = await dataProvider.getList<Lesson>('lessons');
      const students = users.filter(u => u.role === 'student');
      
      // Count activities as sum of related content in lessons
      let totalActivities = 0;
      lessons.forEach(l => {
        totalActivities += (l.relatedHeritageIds?.length || 0);
      });

      const completed = students.filter(s => (s.progressPercent || 0) >= 100).length;

      setStats({
        classes: classes.length,
        students: students.length,
        lessons: lessons.length,
        activities: totalActivities,
        quizzes: 0,
        completed: completed,
        notCompleted: students.length - completed
      });
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Tổng quan giáo viên</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100">
          <Clock size={16} /> Cập nhật: {formatDate(new Date())}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Lớp học quản lý" value={stats.classes} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Users} label="Tổng số học sinh" value={stats.students} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={BookOpen} label="Bài học di sản" value={stats.lessons} color="bg-purple-100 text-purple-600" />
        <StatCard icon={MapIcon} label="Hoạt động di sản" value={stats.activities} color="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Tiến độ hoàn thành
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Đã hoàn thành bài học</span>
                <span className="text-sm font-bold text-emerald-600">{stats.completed} học sinh</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.completed / stats.students) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Chưa hoàn thành</span>
                <span className="text-sm font-bold text-amber-600">{stats.notCompleted} học sinh</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.notCompleted / stats.students) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[
              { user: 'Lê Thị B', action: 'đã hoàn thành bài học', target: 'Văn minh Sông Hồng', time: '2 phút trước', icon: CheckCircle, color: 'text-emerald-500' },
              { user: 'Trần Văn D', action: 'đã xem di sản', target: 'Địa lý vùng cao', time: '15 phút trước', icon: MapIcon, color: 'text-blue-500' },
              { user: 'Nguyễn An', action: 'đã tìm hiểu về', target: 'Hát Then Tuyên Quang', time: '1 giờ trước', icon: MessageSquare, color: 'text-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className={`mt-1 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-bold">{item.user}</span> {item.action} <span className="font-medium text-emerald-600">{item.target}</span>
                  </p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
